// ===================================================================================
//  AI.JS
//  Manages the AI opponent and engine interaction.
// ===================================================================================

let stockfish;
let isStockfishThinking = false;
let engineTimeout = null;
let liveAnalysisStockfish = null;

/**
 * Initializes the Stockfish web workers.
 */
function initEngine(onAiMove, onEngineReady, onEngineError) {
    fetch(APP_CONFIG.STOCKFISH_URL)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch Stockfish: ${response.statusText}`);
            return response.text();
        })
        .then(text => {
            try {
                // --- AI Opponent Engine ---
                let lastEval = 0;
                stockfish = new Worker(URL.createObjectURL(new Blob([text], { type: 'application/javascript' })));
                stockfish.onmessage = event => {
                    const message = event.data;
                    if (message.startsWith('bestmove')) {
                        clearTimeout(engineTimeout);
                        isStockfishThinking = false; // CRITICAL FIX
                        const move = message.split(' ')[1];
                        console.log({ logType: 'engine_move', move: move, eval: (lastEval / 100).toFixed(2) });
                        onAiMove(move);
                    } else if (message.startsWith('info depth')) {
                        const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                        if (scoreMatch) {
                            let score = parseInt(scoreMatch[2], 10);
                            if (scoreMatch[1] === 'mate') score = (score > 0 ? 1 : -1) * APP_CONFIG.MATE_SCORE;
                            if (game.turn() === 'b') score = -score;
                            lastEval = score;
                            updateEvalBar(score);
                        }
                    }
                };
                stockfish.onerror = (error) => {
                    console.error('AI Stockfish Worker Error:', error);
                    onEngineError('AI chess engine encountered an error.');
                };
                stockfish.postMessage('uci');
                stockfish.postMessage('isready');

                // --- Live Analysis Engine ---
                liveAnalysisStockfish = new Worker(URL.createObjectURL(new Blob([text], { type: 'application/javascript' })));
                liveAnalysisStockfish.onerror = (error) => {
                    console.error('Live Analysis Stockfish Worker Error:', error);
                    liveAnalysisStockfish = null;
                };
                liveAnalysisStockfish.postMessage('uci');
                liveAnalysisStockfish.postMessage('isready');
                console.log({ logType: 'info', text: "Live analysis engine initialized." });

                onEngineReady();

            } catch (workerError) {
                console.error('Failed to create Stockfish worker:', workerError);
                throw workerError;
            }
        })
        .catch(error => {
            console.error('Failed to load Stockfish:', error);
            onEngineError('Could not load chess engine. Please check internet connection.');
        });
}

/**
 * Asks the Stockfish engine to calculate and make a move.
 */
function makeAiMove() {
    // CRITICAL FIX: Add guards to prevent AI from thinking when game is over.
    if (!gameActive || game.game_over() || !stockfish) {
        isStockfishThinking = false;
        return;
    }

    isStockfishThinking = true;
    updateStatus();

    engineTimeout = setTimeout(() => {
        console.error("AI Timeout: Engine did not respond in 20 seconds.");
        isStockfishThinking = false;
        updateStatus();
    }, 20000);

    const difficulty = DIFFICULTY_SETTINGS[aiDifficulty];
    const fen = game.fen();
    stockfish.postMessage(`position fen ${fen}`);
    let goCommand = '';

    // Handle non-stockfish difficulty levels
    if (difficulty.type !== 'stockfish') {
        let moveResult = null;
        if (difficulty.type === 'random') {
            const moves = game.moves();
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            moveResult = game.move(randomMove, { sloppy: true });
        } else if (difficulty.type === 'greedy') {
            let bestMove = null;
            let maxVal = -1;
            game.moves({ verbose: true }).forEach(move => {
                let moveVal = 0;
                if (move.captured) moveVal = MATERIAL_POINTS[move.captured] || 0;
                if (moveVal > maxVal) { maxVal = moveVal; bestMove = move; }
            });
            if (!bestMove) bestMove = game.moves({verbose: true})[0];
            moveResult = game.move(bestMove.san, { sloppy: true });
        }
        
        clearTimeout(engineTimeout);
        if (moveResult) {
            setTimeout(() => {
                board.position(game.fen());
                processMoveResult(moveResult, true); // This sets isStockfishThinking to false
            }, 300);
        } else {
            isStockfishThinking = false; // Ensure flag is reset if no move is found
        }
        return;
    }

    // Handle stockfish difficulty
    if (difficulty.depth) goCommand = `go depth ${difficulty.depth}`;
    else if (difficulty.movetime) goCommand = `go movetime ${difficulty.movetime}`;
    
    console.log({ logType: 'info', text: `AI starts thinking. Command: ${goCommand}` });
    stockfish.postMessage(goCommand);
}