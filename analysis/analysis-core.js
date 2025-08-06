// ===================================================================================
//  ANALYSIS-CORE.JS
//  Defines the main AnalysisController and its core data/logic.
// ===================================================================================

window.AnalysisController = {
    // --- UI Element References (will be populated by analysis-ui.js) ---
    moveListElement: null,
    evalChartCanvas: null,
    assessmentDetailsElement: null,
    assessmentTitleElement: null,
    assessmentCommentElement: null,
    analysisBoard: null,
    analysisBoardElement: null,
    boardWrapper: null,
    reviewSummaryContainer: null,
    whiteAccuracyElement: null,
    blackAccuracyElement: null,
    moveCountsContainer: null,
    retryMistakeBtn: null,
    bestLineDisplay: null,
    bestLineMoves: null,
    analysisBoardSvgOverlay: null,
    visualizerBoard: null,
    visualizerBoardWrapper: null,
    visualizerStatusElement: null,
    visualizerMoveNumberElement: null,
    visualizerMovePlayedElement: null,
    visualizerMoveAssessmentElement: null,
    visualizerProgressBar: null,

    // --- State Variables ---
    stockfish: null, 
    analysisGame: new Chess(),
    gameHistory: [],
    reviewData: [],
    evalChart: null,
    currentMoveIndex: -1,
    isAnalyzing: false,
    isDeepAnalyzing: false, // Flag to prevent multiple deep analyses at once
    accuracy: { w: 0, b: 0 },
    moveCounts: { w: {}, b: {} },
    cpl: { w: [], b: [] },
    userShapes: [],
    isDrawing: false,
    drawStartSquare: null,

    // --- Constants ---
    CLASSIFICATION_DATA: {
        'Brilliant': { title: 'Brilliant', comment: 'A great sacrifice or the only good move in a critical position!', color: 'text-teal-400', icon: '!!' },
        'Great': { title: 'Great Move', comment: 'Finds the only good move in a complex position.', color: 'text-sky-300', icon: '!' },
        'Best': { title: 'Best Move', comment: 'The strongest move, according to the engine.', color: 'text-amber-300', icon: '★' },
        'Excellent': { title: 'Excellent', comment: 'A strong move that maintains the position\'s potential.', color: 'text-sky-400', icon: '✓' },
        'Good': { title: 'Good', comment: 'A solid, decent move.', color: 'text-green-400', icon: '👍' },
        'Book': { title: 'Book Move', comment: 'A standard opening move from theory.', color: 'text-gray-400', icon: '📖' },
        'Inaccuracy': { title: 'Inaccuracy', comment: 'This move weakens your position slightly.', color: 'text-yellow-500', icon: '?!' },
        'Mistake': { title: 'Mistake', comment: 'A significant error that damages your position.', color: 'text-orange-500', icon: '?' },
        'Blunder': { title: 'Blunder', comment: 'A very bad move that could lead to losing the game.', color: 'text-red-600', icon: '??' },
        'Miss': { title: 'Missed Opportunity', comment: 'Your opponent made a mistake, but you missed the best punishment.', color: 'text-purple-400', icon: '...' }
    },

    init: function() {
        console.log('AnalysisController: Initializing with dedicated engine...');
        const gameData = window.gameDataToAnalyze;
        if (!gameData || !gameData.stockfish || !gameData.pgn) {
            this.showError("Game data is missing or incomplete for analysis.");
            return;
        }

        try {
            this.isAnalyzing = true; 
            this.stockfish = gameData.stockfish;
            
            this.analysisGame = new Chess();
            this.analysisGame.load_pgn(gameData.pgn);
            this.gameHistory = this.analysisGame.history({ verbose: true });
            this.reviewData = []; // Clear previous analysis data
            this.currentMoveIndex = -1;

            // Reset all state variables
            this.userShapes = [];
            this.isDrawing = false;
            this.drawStartSquare = null;
            this.accuracy = { w: 0, b: 0 };
            this.cpl = { w: [], b: [] };
            this.moveCounts = { w: {}, b: {} };
            for (const key in this.CLASSIFICATION_DATA) {
                this.moveCounts.w[key] = 0;
                this.moveCounts.b[key] = 0;
            }

            this.populateUIReferences();
            this.initializeVisualizerBoard();
            this.runGameReview(); // This is now the "Fast Pass"
            
        } catch (error) {
            console.error('AnalysisController: Error during initialization:', error);
            this.showError("Failed to initialize analysis system.");
            this.isAnalyzing = false;
        }
    },

    showError: function(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Analysis Error', text: message, icon: 'error', confirmButtonText: 'Return to Game'
            }).then(() => {
                if (typeof switchToMainGame === 'function') switchToMainGame();
                else $('#return-to-game-btn').click();
            });
        }
    },

    stop: function() {
        console.log('AnalysisController: Stopping analysis...');
        this.isAnalyzing = false;
        
        if (this.stockfish) { 
            this.stockfish.terminate();
            this.stockfish = null;
            analysisStockfish = null;
        }
        
        if (this.evalChart) { try { this.evalChart.destroy(); this.evalChart = null; } catch (e) { console.warn(e); } }
        if (this.visualizerBoard) { try { this.visualizerBoard.destroy(); this.visualizerBoard = null; } catch(e) { console.warn(e); }}
        if (this.analysisBoard) { try { this.analysisBoard.destroy(); this.analysisBoard = null; } catch(e) { console.warn(e); }}
        if(this.reviewSummaryContainer) this.reviewSummaryContainer.addClass('hidden');
        if(this.assessmentDetailsElement) this.assessmentDetailsElement.addClass('hidden');
        
        $(document).off('keydown.analysis');
        $(document).off('mouseup.analysis_draw');

        this.clearUserShapes();
        this.reviewData = [];
        this.currentMoveIndex = -1;
    },

    // UPDATED: This function is now a "Fast Pass" for an instant report.
    runGameReview: async function() {
        if (this.gameHistory.length === 0) {
            this.showError("No moves to analyze.");
            return;
        }
        
        try {
            let tempGame = new Chess();
            let opponentCpl = 0;

            for (let i = 0; i < this.gameHistory.length && this.isAnalyzing; i++) {
                const move = this.gameHistory[i];
                const progressPercent = ((i + 1) / this.gameHistory.length) * 100;

                this.visualizerStatusElement.text(`Analyzing move ${i + 1} of ${this.gameHistory.length} (Fast Pass)...`);
                this.visualizerProgressBar.css('width', `${progressPercent}%`);
                this.visualizerBoard.position(tempGame.fen());
                
                const positionEval = await this.getStaticEvaluation(tempGame.fen(), { movetime: 500 });
                const evalBeforeMove = (move.color === 'w') ? positionEval.best : -positionEval.best;
                
                tempGame.move(move);
                
                const evalAfterMove = await this.getStaticEvaluation(tempGame.fen(), { movetime: 500 });
                const evalAfterFromPlayerPerspective = (move.color === 'w') ? evalAfterMove.best : -evalAfterMove.best;
                const cpl = Math.max(0, evalBeforeMove - evalAfterFromPlayerPerspective);
                const bestMoveAdvantage = Math.abs(positionEval.best - positionEval.second);
                const classification = this.classifyMove(cpl, opponentCpl, bestMoveAdvantage, tempGame.pgn());

                this.visualizerMovePlayedElement.text(move.san);
                const classificationInfo = this.CLASSIFICATION_DATA[classification];
                this.visualizerMoveAssessmentElement.text(classificationInfo.title).attr('class', `font-bold ${classificationInfo.color}`);
                
                // Store results in our cache
                this.reviewData.push({
                    move: move.san,
                    score: evalAfterMove.best,
                    classification: classification,
                    bestLineUci: positionEval.best_pv,
                    cpl: cpl
                });

                opponentCpl = cpl;
            }

            if (this.isAnalyzing) {
                this.recalculateStats(); // Recalculate accuracy based on the fast pass
                
                if (typeof switchToAnalysisRoom === 'function') {
                    switchToAnalysisRoom();
                }
                
                this.initializeBoard();
                this.setupEventHandlers();
                this.renderFinalReview();
            }
        } catch (error) {
            this.showError(`Analysis failed during move review. Error: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
        }
    },

    // NEW: Function for on-demand deep analysis of a single move
    runDeepAnalysis: async function(moveIndex) {
        if (this.isDeepAnalyzing) return; // Prevent multiple analyses at once
        this.isDeepAnalyzing = true;
        this.updateMoveInUI(moveIndex, { isAnalyzing: true }); // Show loading state in UI

        try {
            const move = this.gameHistory[moveIndex];
            const opponentCpl = (moveIndex > 0) ? this.reviewData[moveIndex - 1].cpl : 0;

            // Reconstruct the board state up to the move
            let tempGame = new Chess();
            for (let i = 0; i < moveIndex; i++) {
                tempGame.move(this.gameHistory[i]);
            }
            
            // Run deep evaluation before and after the move
            const positionEval = await this.getStaticEvaluation(tempGame.fen(), { movetime: 5000 });
            const evalBeforeMove = (move.color === 'w') ? positionEval.best : -positionEval.best;
            
            tempGame.move(move);
            
            const evalAfterMove = await this.getStaticEvaluation(tempGame.fen(), { movetime: 5000 });
            const evalAfterFromPlayerPerspective = (move.color === 'w') ? evalAfterMove.best : -evalAfterMove.best;

            // Recalculate and update the cached data
            const cpl = Math.max(0, evalBeforeMove - evalAfterFromPlayerPerspective);
            const bestMoveAdvantage = Math.abs(positionEval.best - positionEval.second);
            const classification = this.classifyMove(cpl, opponentCpl, bestMoveAdvantage, tempGame.pgn());
            
            this.reviewData[moveIndex] = {
                move: move.san,
                score: evalAfterMove.best,
                classification: classification,
                bestLineUci: positionEval.best_pv,
                cpl: cpl
            };
            
            this.recalculateStats();
            this.renderReviewSummary();
            this.drawEvalChart();
            this.updateMoveInUI(moveIndex, { isAnalyzing: false });
            this.showMoveAssessmentDetails(moveIndex); // Refresh details panel
        } catch (error) {
            console.error("Deep analysis failed:", error);
            this.updateMoveInUI(moveIndex, { isAnalyzing: false, hasError: true });
        } finally {
            this.isDeepAnalyzing = false;
        }
    },

    // UPDATED: Now accepts an options object for flexible analysis time
    getStaticEvaluation: function(fen, options = {}) {
        return new Promise((resolve) => {
            const movetime = options.movetime || 3000;
            if (!this.stockfish) return resolve({ best: 0, second: 0, best_pv: '' });
            
            let scores = {}; let best_pv = ''; let bestMoveFound = false;

            const timeout = setTimeout(() => {
                if (!bestMoveFound) {
                    this.stockfish.onmessage = null; 
                    resolve({ best: scores[1] || 0, second: scores[2] || 0, best_pv });
                }
            }, movetime + 2000); // Timeout is analysis time + 2 seconds buffer

            const onMessage = (event) => {
                const message = event.data;
                const pvMatch = message.match(/multipv (\d+) .* pv (.+)/);
                if (pvMatch) {
                    const pvIndex = parseInt(pvMatch[1]);
                    const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                    if (scoreMatch) {
                        let score = parseInt(scoreMatch[2]);
                        if (scoreMatch[1] === 'mate') score = (score > 0 ? 1 : -1) * APP_CONFIG.MATE_SCORE;
                        scores[pvIndex] = score;
                    }
                    if (pvIndex === 1) best_pv = pvMatch[2];
                }
                if (message.startsWith('bestmove')) {
                    bestMoveFound = true;
                    clearTimeout(timeout);
                    this.stockfish.onmessage = null; 
                    try { this.stockfish.postMessage('setoption name MultiPV value 1'); } catch(e) { console.warn(e); }
                    resolve({ best: scores[1] || 0, second: scores[2] || scores[1] || 0, best_pv });
                }
            };
            
            try {
                this.stockfish.onmessage = onMessage;
                this.stockfish.postMessage('setoption name MultiPV value 2');
                this.stockfish.postMessage(`position fen ${fen}`);
                this.stockfish.postMessage(`go movetime ${movetime}`);
            } catch (error) {
                clearTimeout(timeout);
                resolve({ best: 0, second: 0, best_pv: '' });
            }
        });
    },
    
    // NEW: Recalculates stats from the reviewData cache
    recalculateStats: function() {
        this.cpl = { w: [], b: [] };
        this.moveCounts = { w: {}, b: {} };
        for (const key in this.CLASSIFICATION_DATA) {
            this.moveCounts.w[key] = 0;
            this.moveCounts.b[key] = 0;
        }

        this.reviewData.forEach((data, index) => {
            const player = this.gameHistory[index].color;
            if (data.cpl > 0) {
                this.cpl[player].push(Math.min(data.cpl, 350));
            }
            if (this.moveCounts[player] && data.classification in this.moveCounts[player]) {
                this.moveCounts[player][data.classification]++;
            }
        });

        this.calculateAccuracy();
    },
    
    classifyMove: function(cpl, opponentCpl, bestMoveAdvantage, pgn) {
        const pgnParts = pgn.split(' ').filter(p => p.includes('.')).length;
        if (pgnParts <= 10 && OPENINGS && OPENINGS.some && OPENINGS.some(o => pgn.trim().startsWith(o.pgn))) return 'Book';
        if (opponentCpl > 150 && cpl > 70) return 'Miss';
        if (cpl < 10 && bestMoveAdvantage > 250) return 'Brilliant';
        if (cpl < 10 && bestMoveAdvantage > 100) return 'Great';
        if (cpl >= 300) return 'Blunder';
        if (cpl >= 120) return 'Mistake';
        if (cpl >= 50) return 'Inaccuracy';
        if (cpl < 10) return 'Best';
        if (cpl < 30) return 'Excellent';
        return 'Good';
    },

    calculateAccuracy: function() {
        const calculate = (cpl_array) => {
            if (cpl_array.length === 0) return 100;
            const avg_cpl = cpl_array.reduce((a, b) => a + b, 0) / cpl_array.length;
            return Math.max(0, Math.min(100, Math.round(103.16 * Math.exp(-0.04354 * avg_cpl))));
        };
        this.accuracy.w = calculate(this.cpl.w);
        this.accuracy.b = calculate(this.cpl.b);
    },
    
    uciToSanLine: function(fen, uciLine) {
        try {
            const tempGame = new Chess(fen);
            const moves = uciLine.split(' ');
            let sanMoves = [];
            for (let i = 0; i < Math.min(moves.length, 5); i++) {
                const move = tempGame.move(moves[i], { sloppy: true });
                if (move) sanMoves.push(move.san); else break;
            }
            return sanMoves.join(' ');
        } catch(e) {
            return uciLine;
        }
    },
};
