// ===================================================================================
//  ANALYSIS.JS
//  Main controller for the game analysis feature.
// ===================================================================================

window.AnalysisController = {
    // --- State Variables ---
    gameHistory: [],
    reviewData: [],
    currentMoveIndex: -1,

    /**
     * Initializes the analysis process. This is now an INSTANTANEOUS process.
     */
    init() {
        console.log('AnalysisController: Initializing with pre-computed live analysis data...');
        const gameData = window.gameDataToAnalyze;

        if (!gameData || !gameData.pgn || !gameData.liveAnalysisData) {
            this.showError("Live analysis data is missing. Cannot build review.");
            return;
        }

        // --- Setup Core Data ---
        const tempGame = new Chess();
        tempGame.load_pgn(gameData.pgn);
        this.gameHistory = tempGame.history({ verbose: true });
        this.reviewData = gameData.liveAnalysisData;
        this.currentMoveIndex = -1;

        // --- Build the UI ---
        isAnalysisMode = true; // CRITICAL: Set the global state flag
        mainGameView.addClass('hidden');
        analysisRoomView.removeClass('hidden');
        AnalysisVisualizer.hide(); // No longer needed

        this.recalculateStats();

        AnalysisBoard.init();
        AnalysisReview.renderMoveList(this.gameHistory, this.reviewData);
        AnalysisReview.renderSummary(this.accuracy, this.moveCounts);
        AnalysisChart.draw(this.reviewData);

        this.setupEventHandlers();
        this.navigateToMove(0);
    },

    /**
     * Stops the analysis mode and cleans up.
     */
    stop() {
        console.log('AnalysisController: Stopping analysis mode.');
        isAnalysisMode = false; // CRITICAL: Reset the global state flag
        AnalysisChart.destroy();
    },

    /**
     * Sets up all event handlers for the analysis room UI using event delegation.
     */
    setupEventHandlers() {
        const moveList = AnalysisReview.moveListElement;

        // Accordion toggle
        moveList.off('click.toggle').on('click.toggle', '.accordion-header', function() {
            $(this).next('ul').slideToggle(200);
        });
        
        // Click to navigate to a move
        moveList.off('click.navigate').on('click.navigate', 'li[data-move-index]', (e) => {
            const moveIndex = parseInt($(e.currentTarget).data('move-index'));
            if (!isNaN(moveIndex)) {
                this.navigateToMove(moveIndex);
                playSound('moveSelf');
            }
        });

        // Click to request deep analysis
        moveList.off('click.deep_analyze').on('click.deep_analyze', '.deep-analysis-btn', (e) => {
            e.stopPropagation();
            const category = $(e.currentTarget).data('deep-analysis-key');
            this.requestDeepAnalysis(category);
        });

        // Hovering over a move to show a preview arrow
        moveList.off('mouseenter mouseleave', 'li[data-move-from]').on('mouseenter mouseleave', 'li[data-move-from]', (e) => {
            if (e.type === 'mouseenter') {
                const from = $(e.currentTarget).data('move-from');
                const to = $(e.currentTarget).data('move-to');
                AnalysisBoard.userShapes.push({ type: 'arrow', from, to, color: 'rgba(59, 130, 246, 0.7)' });
                AnalysisBoard.redrawShapes();
            } else {
                AnalysisBoard.userShapes = AnalysisBoard.userShapes.filter(shape => shape.color !== 'rgba(59, 130, 246, 0.7)');
                AnalysisBoard.redrawShapes();
            }
        });
        
        // Retry mistake button
        AnalysisReview.retryMistakeBtn.off('click').on('click', () => {
            const tempGame = new Chess();
            for (let i = 0; i < this.currentMoveIndex; i++) { tempGame.move(this.gameHistory[i]); }
            window.loadFenOnReturn = tempGame.fen();
            this.switchToMainGame();
        });
    },
    
    /**
     * Navigates the analysis view to a specific move index.
     */
    navigateToMove(moveIndex) {
        if (moveIndex < 0 || moveIndex >= this.gameHistory.length) return;
        this.currentMoveIndex = moveIndex;
        
        const tempGame = new Chess();
        for (let i = 0; i <= moveIndex; i++) { tempGame.move(this.gameHistory[i]); }
        
        AnalysisBoard.board.position(tempGame.fen());
        AnalysisReview.highlightMove(moveIndex);
        AnalysisReview.showMoveAssessment(moveIndex, this.reviewData, this.gameHistory);
        AnalysisBoard.redrawShapes();
    },

    /**
     * Recalculates all player stats from the review data.
     */
    recalculateStats() {
        this.cpl = { w: [], b: [] };
        this.moveCounts = { w: {}, b: {} };
        Object.keys(CLASSIFICATION_DATA).forEach(key => {
            this.moveCounts.w[key] = 0;
            this.moveCounts.b[key] = 0;
        });
        
        this.reviewData.forEach((data, index) => {
            if (!data) return;
            const player = this.gameHistory[index].color;
            if (data.cpl > 0) this.cpl[player].push(Math.min(data.cpl, 350));
            if (this.moveCounts[player] && data.classification in this.moveCounts[player]) {
                this.moveCounts[player][data.classification]++;
            }
        });
        
        this.accuracy.w = calculateAccuracy(this.cpl.w);
        this.accuracy.b = calculateAccuracy(this.cpl.b);
    },

    /**
     * Placeholder function for future deep analysis implementation.
     */
    requestDeepAnalysis(category) {
        console.log(`Deep analysis requested for category: ${category}`);
        Swal.fire('Coming Soon!', `Deep analysis for the "${category}" category is a planned feature.`, 'info');
    },
    
    /**
     * Switches view back to the main game.
     */
    switchToMainGame() {
        this.stop();
        analysisRoomView.addClass('hidden');
        mainGameView.removeClass('hidden');
        
        if (window.loadFenOnReturn) {
            startNewGameWithTime(gameTime.base, gameTime.inc, window.loadFenOnReturn);
            delete window.loadFenOnReturn;
        } else {
            // If just returning, ensure the board is correctly sized.
            setTimeout(() => { if(board) board.resize(); }, 50);
        }
    },

    /**
     * Displays an error and provides a way to exit analysis.
     */
    showError(message) {
        this.stop();
        Swal.fire({
            title: 'Analysis Error', text: message, icon: 'error', confirmButtonText: 'Return to Game'
        }).then(() => this.switchToMainGame());
    }
};