// ===================================================================================
//  ENGINE.JS
//  This module is the sole interface for communicating with the Stockfish Web Worker.
//  It handles initialization, command sending, and message parsing.
// ===================================================================================

window.ChessApp = window.ChessApp || {};
ChessApp.engine = (function() {
    'use strict';

    // --- Private State ---

    let stockfish = null;
    let isReady = false;
    let onBestMoveCallback = null;
    let onInfoCallback = null;

    // --- Private Methods ---

    /**
     * Permanent message handler for parsing engine output after initialization.
     * @param {MessageEvent} event - The event object from the worker.
     */
    function parseEngineMessages(event) {
        const message = event.data;

        // Don't log noisy info messages
        if (!message.startsWith('info depth')) {
            console.log(`Stockfish: ${message}`);
        }

        if (message.startsWith('bestmove')) {
            const bestMove = message.split(' ')[1];
            if (onBestMoveCallback) {
                onBestMoveCallback(bestMove);
            }
        } else if (message.startsWith('info')) {
            if (onInfoCallback) {
                const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                if (scoreMatch) {
                    let score = parseInt(scoreMatch[2], 10);
                    if (scoreMatch[1] === 'mate') {
                        score = (score > 0 ? 1 : -1) * ChessApp.config.APP_CONFIG.MATE_SCORE;
                    }
                    onInfoCallback({ score });
                }
            }
        }
    }

    // --- Public Methods ---

    /**
     * Initializes the Stockfish engine. It fetches the engine script and sets up
     * the Web Worker using a robust method that works on all platforms.
     * @returns {Promise} A promise that resolves when the engine is ready or rejects on failure.
     */
    function init() {
        console.log("Initializing Engine Module...");
        return new Promise((resolve, reject) => {
            fetch(ChessApp.config.APP_CONFIG.STOCKFISH_URL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch Stockfish: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(text => {
                    try {
                        const blob = new Blob([text], { type: 'application/javascript' });
                        stockfish = new Worker(URL.createObjectURL(blob));
                        
                        stockfish.onmessage = (event) => {
                            const message = event.data;
                            if (message === 'readyok') {
                                isReady = true;
                                console.log("Engine is ready.");
                                // Switch to the permanent message handler
                                stockfish.onmessage = parseEngineMessages;
                                resolve();
                            }
                        };
                        
                        stockfish.onerror = (error) => {
                            console.error('Stockfish Worker Error:', error);
                            reject(error);
                        };

                        stockfish.postMessage('uci');
                        stockfish.postMessage('isready');

                    } catch (error) {
                        console.error("Failed to create Stockfish worker from blob:", error);
                        reject(error);
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch Stockfish script:", error);
                    reject(error);
                });
        });
    }

    /**
     * Asks the engine to find the best move for a given position and difficulty.
     * @param {string} fen - The FEN string of the position to analyze.
     * @param {number} difficultyLevel - The difficulty level (1-12).
     */
    function findBestMove(fen, difficultyLevel) {
        if (!isReady) {
            console.error("Engine not ready, cannot find best move.");
            return;
        }

        const difficulty = ChessApp.config.DIFFICULTY_SETTINGS[difficultyLevel];
        if (!difficulty || difficulty.type !== 'stockfish') {
            // For non-stockfish levels, the game module should handle it.
            // This function is only for stockfish communication.
            return; 
        }

        stockfish.postMessage(`position fen ${fen}`);
        const goCommand = difficulty.depth ? `go depth ${difficulty.depth}` : `go movetime ${difficulty.movetime}`;
        stockfish.postMessage(goCommand);
    }

    /**
     * Sets the callback function to be executed when the engine finds a best move.
     * @param {Function} callback - The function to call with the best move (e.g., "e2e4").
     */
    function onBestMove(callback) {
        onBestMoveCallback = callback;
    }

    /**
     * Sets the callback function to be executed when the engine provides analysis info.
     * @param {Function} callback - The function to call with info data (e.g., { score: 50 }).
     */
    function onInfo(callback) {
        onInfoCallback = callback;
    }

    /**
     * Tells the engine to stop its current calculation.
     */
    function stop() {
        if (stockfish && isReady) {
            stockfish.postMessage('stop');
        }
    }

    // Expose public methods
    return {
        init,
        findBestMove,
        onBestMove,
        onInfo,
        stop
    };

})();