// ===================================================================================
//  ANALYSIS-ENGINE.JS
//  Manages communication with the dedicated analysis Stockfish engine.
// ===================================================================================

/**
 * Gets a quick evaluation for a given position for live analysis during a game.
 * @param {string} fen - The FEN string of the position to evaluate.
 * @returns {Promise<number>} A promise that resolves with the evaluation score in centipawns.
 */
function getLiveEvaluation(fen) {
    return new Promise((resolve) => {
        if (!liveAnalysisStockfish) return resolve(0);

        let bestScore = 0;
        let onMessage;

        const timeout = setTimeout(() => {
            if (liveAnalysisStockfish) liveAnalysisStockfish.onmessage = null;
            console.warn(`Live analysis timed out for FEN: ${fen}`);
            resolve(bestScore);
        }, 3000); // 3-second timeout for live eval

        onMessage = (event) => {
            const message = event.data;
            if (message.startsWith('info depth')) {
                const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                if (scoreMatch) {
                    let score = parseInt(scoreMatch[2]);
                    if (scoreMatch[1] === 'mate') {
                        score = (score > 0 ? 1 : -1) * APP_CONFIG.MATE_SCORE;
                    }
                    bestScore = score;
                }
            }
            if (message.startsWith('bestmove')) {
                clearTimeout(timeout);
                if (liveAnalysisStockfish) liveAnalysisStockfish.onmessage = null;
                resolve(bestScore);
            }
        };

        try {
            liveAnalysisStockfish.onmessage = onMessage;
            liveAnalysisStockfish.postMessage('stop');
            liveAnalysisStockfish.postMessage(`position fen ${fen}`);
            liveAnalysisStockfish.postMessage('go depth 12'); // A shallow depth for speed
        } catch (e) {
            console.error("Failed to send command to live analysis engine.", e);
            clearTimeout(timeout);
            resolve(0);
        }
    });
}

/**
 * Gets a deeper, static evaluation for post-game analysis, returning multiple lines.
 * @param {string} fen - The FEN of the position to evaluate.
 * @param {object} options - Analysis options, like movetime.
 * @returns {Promise<object>} A promise resolving with best/second best moves and scores.
 */
function getStaticEvaluation(fen, options = {}) {
    return new Promise((resolve) => {
        if (!window.AnalysisController || !window.AnalysisController.stockfish) {
            return resolve({ best: 0, second: 0, best_pv: '' });
        }
        const analysisStockfish = window.AnalysisController.stockfish;

        const movetime = options.movetime || 3000;
        let scores = {};
        let best_pv = '';
        let bestMoveFound = false;

        const timeout = setTimeout(() => {
            if (!bestMoveFound) {
                analysisStockfish.onmessage = null;
                resolve({ best: scores[1] || 0, second: scores[2] || 0, best_pv });
            }
        }, movetime + 5000); // Generous timeout buffer

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
                analysisStockfish.onmessage = null;
                try { analysisStockfish.postMessage('setoption name MultiPV value 1'); } catch (e) { console.warn(e); }
                resolve({ best: scores[1] || 0, second: scores[2] || scores[1] || 0, best_pv });
            }
        };

        try {
            analysisStockfish.onmessage = onMessage;
            analysisStockfish.postMessage('setoption name MultiPV value 2');
            analysisStockfish.postMessage(`position fen ${fen}`);
            analysisStockfish.postMessage(`go movetime ${movetime}`);
        } catch (error) {
            clearTimeout(timeout);
            resolve({ best: 0, second: 0, best_pv: '' });
        }
    });
}