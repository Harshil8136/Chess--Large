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
    ADAPTIVE_DEPTH: {
        opening: 12, 
        endgame: 16, 
        opening_ply: 20
    },

    /**
     * Entry point called by main.js to start the analysis mode.
     */
    init: function() {
        console.log('AnalysisController: Initializing...');
        
        const gameData = window.gameDataToAnalyze;
        if (!gameData || !gameData.stockfish || !gameData.pgn) {
            this.showError("Game data is missing or incomplete for analysis.");
            return;
        }

        try {
            this.stockfish = gameData.stockfish;
            this.analysisGame = new Chess();
            this.analysisGame.load_pgn(gameData.pgn);
            this.gameHistory = this.analysisGame.history({ verbose: true });
            this.reviewData = [];
            this.currentMoveIndex = -1;
            this.isAnalyzing = false;

            // Reset state
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

            // Populate UI Element References
            this.populateUIReferences();
            
            this.initializeBoard();
            this.initializeVisualizerBoard();
            this.setupEventHandlers();
            this.runGameReview();
            
        } catch (error) {
            console.error('AnalysisController: Error during initialization:', error);
            this.showError("Failed to initialize analysis system.");
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
        } else {
            alert('Analysis Error: ' + message);
        }
    },

    stop: function() {
        console.log('AnalysisController: Stopping analysis...');
        this.isAnalyzing = false;
        if (this.stockfish) { try { this.stockfish.postMessage('stop'); } catch (e) { console.warn(e); } }
        if (this.evalChart) { try { this.evalChart.destroy(); this.evalChart = null; } catch (e) { console.warn(e); } }
        if (this.visualizerBoard) { try { this.visualizerBoard.destroy(); this.visualizerBoard = null; } catch(e) { console.warn(e); }}
        if(this.reviewSummaryContainer) this.reviewSummaryContainer.addClass('hidden');
        if(this.assessmentDetailsElement) this.assessmentDetailsElement.addClass('hidden');
        
        $(document).off('keydown.analysis');
        $(document).off('mouseup.analysis_draw');

        this.clearUserShapes();
        this.reviewData = [];
        this.currentMoveIndex = -1;
    },

    runGameReview: async function() {
        if (this.gameHistory.length === 0) {
            this.showError("No moves to analyze.");
            return;
        }
        this.isAnalyzing = true;
        
        try {
            let tempGame = new Chess();
            let opponentCpl = 0;

            for (let i = 0; i < this.gameHistory.length && this.isAnalyzing; i++) {
                const move = this.gameHistory[i];
                const progressPercent = ((i + 1) / this.gameHistory.length) * 100;

                // Update visualizer
                this.visualizerStatusElement.text(`Analyzing move ${i + 1} of ${this.gameHistory.length}...`);
                this.visualizerProgressBar.css('width', `${progressPercent}%`);
                this.visualizerBoard.position(tempGame.fen());
                
                const positionEval = await this.getStaticEvaluation(tempGame.fen(), i);
                const evalBeforeMove = (move.color === 'w') ? positionEval.best : -positionEval.best;
                
                tempGame.move(move.san);
                
                const evalAfterMove = await this.getStaticEvaluation(tempGame.fen(), i + 1);
                const evalAfterFromPlayerPerspective = (move.color === 'w') ? evalAfterMove.best : -evalAfterMove.best;
                const cpl = Math.max(0, evalBeforeMove - evalAfterFromPlayerPerspective);
                const bestMoveAdvantage = Math.abs(positionEval.best - positionEval.second);
                const classification = this.classifyMove(cpl, opponentCpl, bestMoveAdvantage, tempGame.pgn());

                // Update visualizer with move info
                this.visualizerMoveNumberElement.text(`${Math.floor(i / 2) + 1}${move.color === 'w' ? '.' : '...'}`);
                this.visualizerMovePlayedElement.text(move.san);
                const classificationInfo = this.CLASSIFICATION_DATA[classification];
                this.visualizerMoveAssessmentElement.text(classificationInfo.title).attr('class', `font-bold ${classificationInfo.color}`);
                
                const player = move.color;
                if (this.moveCounts[player] && classification in this.moveCounts[player]) {
                    this.moveCounts[player][classification]++;
                }
                
                if (cpl > 0) {
                    this.cpl[player].push(Math.min(cpl, 350));
                }

                this.reviewData.push({
                    move: move.san,
                    score: evalAfterMove.best,
                    classification: classification,
                    bestLineUci: positionEval.best_pv
                });

                opponentCpl = cpl;
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            if (this.isAnalyzing) {
                this.calculateAccuracy();
                this.renderReviewSummary();
                // Transition to the main analysis room
                if (typeof switchToAnalysisRoom === 'function') {
                    switchToAnalysisRoom();
                } else {
                    console.error('switchToAnalysisRoom function not found. Cannot display final report.');
                }
                this.renderFinalReview();
            }
        } catch (error) {
            this.showError(`Analysis failed during move review. Error: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
        }
    },

    getStaticEvaluation: function(fen, moveIndex) {
        return new Promise((resolve) => {
            if (!this.stockfish || !this.isAnalyzing) return resolve({ best: 0, second: 0, best_pv: '' });
            
            let scores = {}; let best_pv = ''; let bestMoveFound = false;

            const timeout = setTimeout(() => {
                if (!bestMoveFound) {
                    this.stockfish.onmessage = null; // Clear the listener
                    resolve({ best: scores[1] || 0, second: scores[2] || 0, best_pv });
                }
            }, 8000); // Increased timeout for deeper analysis

            const onMessage = (event) => {
                if (!this.isAnalyzing) {
                    clearTimeout(timeout);
                    this.stockfish.onmessage = null;
                    return resolve({ best: 0, second: 0, best_pv: '' });
                }
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
            
            const depth = (moveIndex < this.ADAPTIVE_DEPTH.opening_ply) ? this.ADAPTIVE_DEPTH.opening : this.ADAPTIVE_DEPTH.endgame;

            try {
                this.stockfish.onmessage = onMessage;
                this.stockfish.postMessage('setoption name MultiPV value 2');
                this.stockfish.postMessage(`position fen ${fen}`);
                this.stockfish.postMessage(`go depth ${depth}`);
            } catch (error) {
                clearTimeout(timeout);
                resolve({ best: 0, second: 0, best_pv: '' });
            }
        });
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