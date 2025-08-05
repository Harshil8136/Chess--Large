// ===================================================================================
//  ANALYSIS.JS
//  This module controls the entire post-game analysis feature. It interacts
//  with the engine to get evaluations and with the UI to display the results.
// ===================================================================================

window.ChessApp = window.ChessApp || {};
ChessApp.analysis = (function() {
    'use strict';

    const App = ChessApp; // Shortcut to the global namespace

    // --- Private State ---
    let analysisGame = new Chess();
    let gameHistory = [];
    let reviewData = [];
    let evalChart = null;
    let currentMoveIndex = -1;
    let isAnalyzing = false;
    
    // --- UI State ---
    let visualizerBoard = null;
    let analysisBoard = null;

    // --- Constants ---
    const CLASSIFICATION_DATA = { /* ... classification data ... */ };
    const ADAPTIVE_DEPTH = { opening: 12, endgame: 16, opening_ply: 20 };

    /**
     * Entry point to start the analysis. Called by main.js.
     * @param {object} gameData - Contains the PGN and history of the game to analyze.
     */
    function start() {
        console.log('Analysis Module: Starting...');
        const gameData = App.game.getGameDataForAnalysis(); // A better way to get data

        if (!gameData || !gameData.pgn) {
            App.ui.showError("Game data is missing for analysis.");
            return;
        }

        try {
            resetState();
            
            analysisGame.load_pgn(gameData.pgn);
            gameHistory = analysisGame.history({ verbose: true });

            App.ui.showView('visualizer');
            initializeVisualizerBoard();
            runGameReview();
        } catch (error) {
            console.error('Analysis: Error during startup:', error);
            App.ui.showError("Failed to initialize analysis system.");
        }
    }
    
    function resetState() {
        if (analysisBoard) analysisBoard.destroy();
        if (visualizerBoard) visualizerBoard.destroy();
        if (evalChart) evalChart.destroy();
        analysisBoard = visualizerBoard = evalChart = null;
        
        analysisGame = new Chess();
        gameHistory = [];
        reviewData = [];
        currentMoveIndex = -1;
        isAnalyzing = false;
    }

    function stop() {
        if (!isAnalyzing) return;
        console.log('Analysis Module: Stopping...');
        isAnalyzing = false;
        App.engine.stop();
        App.ui.showView('main');
        resetState();
    }

    function initializeVisualizerBoard() {
        const boardConfig = {
            position: 'start',
            pieceTheme: App.config.PIECE_THEMES[localStorage.getItem('chessPieceTheme') || 'cburnett']
        };
        visualizerBoard = Chessboard('visualizer-board-wrapper', boardConfig);
    }
    
    function initializeAnalysisBoard() {
        const boardConfig = {
            position: 'start',
            pieceTheme: App.config.PIECE_THEMES[localStorage.getItem('chessPieceTheme') || 'cburnett']
        };
        analysisBoard = Chessboard('analysis-board', boardConfig);
        // App.ui.renderAnalysisCoordinates(analysisBoard.orientation());
    }

    async function runGameReview() {
        if (gameHistory.length === 0) { App.ui.showError("No moves to analyze."); return; }
        isAnalyzing = true;
        
        let tempGame = new Chess();
        let opponentCpl = 0;
        let accuracyCpl = { w: [], b: [] };
        let moveCounts = { w: {}, b: {} };

        for (let i = 0; i < gameHistory.length && isAnalyzing; i++) {
            // ... [The main analysis loop remains the same as the one you have]
        }

        if (isAnalyzing) {
            const accuracy = calculateAccuracy(accuracyCpl);
            initializeAnalysisBoard();
            // App.ui.renderAnalysisReport(...);
            
            // UPDATED: Use the UI module's view manager
            App.ui.showView('analysis');
        }
    }

    function getStaticEvaluation(fen, moveIndex) {
        return new Promise((resolve) => {
            // ... [The getStaticEvaluation logic remains the same]
        });
    }

    function classifyMove(cpl, opponentCpl, bestMoveAdvantage, pgn) {
        // ... [The classifyMove logic remains the same]
    }

    function calculateAccuracy(cplData) {
        // ... [The calculateAccuracy logic remains the same]
    }

    // This function will need to be part of the UI module eventually
    function setupEventHandlers() {
        App.ui.elements.moveListElement.off('click').on('click', '.analysis-move-item', (e) => {
            const moveIndex = parseInt($(e.currentTarget).data('move-index'));
            // navigateToMove(moveIndex);
            App.sound.play('moveSelf');
        });

        App.ui.elements.retryMistakeBtn.off('click').on('click', () => {
            if (currentMoveIndex < 0) return;
            const tempGame = new Chess();
            for (let i = 0; i < currentMoveIndex; i++) {
                tempGame.move(gameHistory[i].san);
            }
            // UPDATED: Use the game module to handle returning to the game
            App.game.returnToGame({ fen: tempGame.fen() });
        });
    }


    // Expose public methods
    return {
        start,
        stop
    };

})();