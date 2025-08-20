// src/js/analysis-core.js

// ===================================================================================
//  ANALYSIS-CORE.JS
//  Defines the main AnalysisController and its core data/logic.
// ===================================================================================

// UPDATED: New private helper function to gracefully stop the engine and wait for it to be ready.
function _resetEngine(stockfish) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Engine did not become ready after 'stop' command."));
        }, 3000); // 3-second timeout for readyok

        stockfish.onmessage = (event) => {
            if (event.data === 'readyok') {
                clearTimeout(timeout);
                stockfish.onmessage = null; // Clean up the listener
                resolve();
            }
        };
        stockfish.postMessage('stop');
        stockfish.postMessage('isready');
    });
}


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
    isDeepAnalyzing: false,
    accuracy: { w: 0, b: 0 },
    moveCounts: { w: {}, b: {} },
    cpl: { w: [], b: [] },
    userShapes: [],
    isDrawing: false,
    drawStartSquare: null,

    // --- State variables for new analysis features ---
    cplByPlayer: { w: [], b: [] },
    elo: { w: 0, b: 0 },
    phaseAnalysis: {
        w: { opening: -1, middlegame: -1, endgame: -1 },
        b: { opening: -1, middlegame: -1, endgame: -1 }
    },

    // UPDATED: Corrected icon paths to include the 'assets/' directory.
    CLASSIFICATION_DATA: {
        'Brilliant': { title: 'Brilliant', comment: 'A great sacrifice or the only good move in a critical position!', color: 'classification-color-brilliant', bgColor: 'classification-bg-brilliant', icon: 'assets/icon/classification-brilliant.png' },
        'Great': { title: 'Great Move', comment: 'Finds the only good move in a complex position.', color: 'classification-color-great', bgColor: 'classification-bg-great', icon: 'assets/icon/classification-great.png' },
        'Best': { title: 'Best Move', comment: 'The strongest move, according to the engine.', color: 'classification-color-best', bgColor: 'classification-bg-best', icon: 'assets/icon/classification-best.png' },
        'Excellent': { title: 'Excellent', comment: 'A strong move that maintains the position\'s potential.', color: 'classification-color-excellent', bgColor: 'classification-bg-excellent', icon: 'assets/icon/classification-excellent.png' },
        'Good': { title: 'Good', comment: 'A solid, decent move.', color: 'classification-color-good', bgColor: 'classification-bg-good', icon: 'assets/icon/classification-good.png' },
        'Book': { title: 'Book Move', comment: 'A standard opening move from theory.', color: 'classification-color-book', bgColor: 'classification-bg-book', icon: 'assets/icon/classification-book.png' },
        'Inaccuracy': { title: 'Inaccuracy', comment: 'This move weakens your position slightly.', color: 'classification-color-inaccuracy', bgColor: 'classification-bg-inaccuracy', icon: 'assets/icon/classification-inaccuracy.png' },
        'Mistake': { title: 'Mistake', comment: 'A significant error that damages your position.', color: 'classification-color-mistake', bgColor: 'classification-bg-mistake', icon: 'assets/icon/classification-mistake.png' },
        'Blunder': { title: 'Blunder', comment: 'A very bad move that could lead to losing the game.', color: 'classification-color-blunder', bgColor: 'classification-bg-blunder', icon: 'assets/icon/classification-blunder.png' },
        'Miss': { title: 'Missed Opportunity', comment: 'Your opponent made a mistake, but you missed the best punishment.', color: 'classification-color-miss', bgColor: 'classification-bg-miss', icon: 'assets/icon/classification-miss.png' }
    },
    DEEP_ANALYSIS_MOVETIME: 2000,

    init: function() {
        Logger.info('AnalysisController: Initializing with dedicated engine...');
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
            this.reviewData = [];
            this.currentMoveIndex = -1;
            this.userShapes = [];
            this.isDrawing = false;
            this.drawStartSquare = null;
            
            // Reset state variables
            this.accuracy = { w: 0, b: 0 };
            this.cplByPlayer = { w: [], b: [] };
            this.elo = { w: 0, b: 0 };
            this.phaseAnalysis = {
                w: { opening: -1, middlegame: -1, endgame: -1 },
                b: { opening: -1, middlegame: -1, endgame: -1 }
            };

            this.populateUIReferences();
            this.initializeVisualizerBoard();
            this.runGameReview();
            
        } catch (error) {
            Logger.error('AnalysisController: Error during initialization', error);
            this.showError("Failed to initialize analysis system.");
            this.isAnalyzing = false;
        }
    },

    showError: function(message) {
        Logger.error('Analysis Error', new Error(message));
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
        Logger.info('AnalysisController: Stopping analysis...');
        this.isAnalyzing = false;
        
        if (this.stockfish) {
            this.stockfish.terminate();
            this.stockfish = null;
        }
        
        if (this.evalChart) { try { this.evalChart.destroy(); this.evalChart = null; } catch (e) { /* ignore */ } }
        if (this.visualizerBoard) { try { this.visualizerBoard.destroy(); this.visualizerBoard = null; } catch(e) { /* ignore */ }}
        if (this.analysisBoard) { try { this.analysisBoard.destroy(); this.analysisBoard = null; } catch(e) { /* ignore */ }}
        
        $(document).off('keydown.analysis');
        $(document).off('mouseup.analysis_draw');
    },

    // UPDATED: The entire review process is upgraded to be "game-aware" and use the resilient engine evaluation.
    runGameReview: async function() {
        if (this.gameHistory.length === 0) {
            this.showError("No moves to analyze.");
            return;
        }
        
        try {
            let tempGame = new Chess();
            let opponentCpl = 0;
            let lastEval = 20;

            for (let i = 0; i < this.gameHistory.length && this.isAnalyzing; i++) {
                const move = this.gameHistory[i];
                const progressPercent = ((i + 1) / this.gameHistory.length) * 100;
                
                this.visualizerStatusElement.text(`Analyzing move ${i + 1} of ${this.gameHistory.length}...`);
                this.visualizerProgressBar.css('width', `${progressPercent}%`);
                this.visualizerBoard.position(tempGame.fen());
                
                const evalBeforePlayer = (move.color === 'w') ? lastEval : -lastEval;
                tempGame.move(move);
                
                let positionEval;
                if (tempGame.game_over()) {
                    Logger.info(`Game-ending move found: ${move.san}. Bypassing engine.`);
                    let finalScore = 0;
                    if (tempGame.in_checkmate()) {
                        finalScore = (move.color === 'w') ? 10000 : -10000;
                    }
                    positionEval = { best: finalScore, second: finalScore, best_pv: '' };
                } else {
                    positionEval = await this._getEvaluationWithRetry(this.stockfish, tempGame.fen(), lastEval);
                }

                const evalAfter = positionEval.best;
                const evalAfterPlayer = (move.color === 'w') ? evalAfter : -evalAfter;
                
                const cpl = Math.max(0, AnalysisHelpers.normalizeEvalForCpl(evalBeforePlayer) - AnalysisHelpers.normalizeEvalForCpl(evalAfterPlayer));
                const moveNum = Math.floor(i / 2) + 1;
                this.cplByPlayer[move.color].push({ cpl: cpl, moveNum: moveNum });

                const classification = AnalysisHelpers.classifyMove({ cpl, opponentCpl, evalBefore: evalBeforePlayer, pgn: tempGame.pgn(), isCheckmate: tempGame.in_checkmate() });
                
                this.visualizerMovePlayedElement.text(move.san);
                const classificationInfo = this.CLASSIFICATION_DATA[classification];
                if (classificationInfo) {
                    this.visualizerMoveAssessmentElement.text(classificationInfo.title).attr('class', `font-bold ${classificationInfo.color}`);
                }
                
                this.reviewData.push({ move: move.san, score: evalAfter, classification, bestLineUci: positionEval.best_pv, cpl });

                opponentCpl = cpl;
                lastEval = evalAfter;
            }

            if (this.isAnalyzing) {
                // Perform final calculations now that the review is complete.
                this.moveCounts = this.reviewData.reduce((acc, data, i) => {
                    const player = this.gameHistory[i].color;
                    if (data.classification) {
                       acc[player][data.classification] = (acc[player][data.classification] || 0) + 1;
                    }
                    return acc;
                }, { w: {}, b: {} });

                const whiteCplArray = this.cplByPlayer.w.map(m => m.cpl);
                const blackCplArray = this.cplByPlayer.b.map(m => m.cpl);
                this.accuracy = { w: AnalysisHelpers.calculateAccuracy(whiteCplArray), b: AnalysisHelpers.calculateAccuracy(blackCplArray) };

                const whiteAvgCpl = whiteCplArray.length > 0 ? whiteCplArray.reduce((a, b) => a + b, 0) / whiteCplArray.length : 0;
                const blackAvgCpl = blackCplArray.length > 0 ? blackCplArray.reduce((a, b) => a + b, 0) / blackCplArray.length : 0;
                this.elo = { w: AnalysisHelpers.cplToElo(whiteAvgCpl), b: AnalysisHelpers.cplToElo(blackAvgCpl) };
                
                switchToAnalysisRoom();
                this.initializeBoard();
                this.setupEventHandlers();
                this.renderFinalReview();
            }
        } catch (error) {
            this.showError(`Analysis failed. Error: ${error.message}`);
            Logger.error('Analysis failed during review process', error);
        } finally {
            this.isAnalyzing = false;
        }
    },
    
    // DELETED: The old, complex getStaticEvaluation function is removed.
    
    // UPDATED: New, fully resilient engine evaluation function with retry and reset logic.
    _getEvaluationWithRetry: async function(stockfish, fen, lastEval) {
        try {
            return await this._singleEvaluationAttempt(stockfish, fen, 1500);
        } catch (error) {
            Logger.warn(`Evaluation timed out. Resetting engine and retrying...`, { fen });
            await _resetEngine(stockfish);
            try {
                return await this._singleEvaluationAttempt(stockfish, fen, 3000);
            } catch (retryError) {
                Logger.error(`Evaluation failed on retry. Using fallback.`, { fen });
                await _resetEngine(stockfish);
                return { best: lastEval, second: lastEval, best_pv: '' };
            }
        }
    },

    // UPDATED: New helper for the evaluation function.
    _singleEvaluationAttempt: function(stockfish, fen, movetime) {
        const evaluationPromise = new Promise((resolve) => {
            let scores = {}; let best_pv = '';
            const handler = (event) => {
                const message = event.data;
                const pvMatch = message.match(/multipv (\d+) .* pv (.+)/);
                if (pvMatch) {
                    const pvIndex = parseInt(pvMatch[1]);
                    const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                    if (scoreMatch) {
                        let score = parseInt(scoreMatch[2]);
                        if (scoreMatch[1] === 'mate') score = (score > 0 ? 1 : -1) * 10000;
                        scores[pvIndex] = score;
                    }
                    if (pvIndex === 1) best_pv = pvMatch[2];
                }
                if (message.startsWith('bestmove')) {
                    stockfish.onmessage = null;
                    resolve({ best: scores[1] || 0, second: scores[2] || 0, best_pv });
                }
            };
            stockfish.onmessage = handler;
            stockfish.postMessage(`position fen ${fen}`);
            stockfish.postMessage(`go movetime ${movetime}`);
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                stockfish.onmessage = null;
                reject(new Error("Evaluation timed out"));
            }, 8000);
        });

        return Promise.race([evaluationPromise, timeoutPromise]);
    },
    
    // DELETED: The old, buggy recalculateStats and calculateAccuracy functions are removed.
    
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
            Logger.warn('Could not convert UCI line to SAN.', { fen, uciLine });
            return uciLine;
        }
    },
};