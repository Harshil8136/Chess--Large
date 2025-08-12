// ===================================================================================
//  GAME.JS
//  Manages core game logic, state, and orchestrates other modules.
// ===================================================================================

// --- Core Game State ---
const game = new Chess();
let gameActive = true;
let humanPlayer = 'w';
let aiPlayer = 'b';
let aiDifficulty = 5;
let pendingMove = null;
let pendingPremove = null;
let reviewMoveIndex = null;
let gameTime = { base: 0, inc: 0 };
let moveAnalysisData = [];
let capturedByWhite = [];
let capturedByBlack = [];
let isLiveAnalyzing = false;

/**
 * Starts a new game with a specific time control.
 */
function startNewGameWithTime(base, inc, fen = null) {
    gameTime = { base, inc };
    whiteTenSecondsWarningPlayed = false;
    blackTenSecondsWarningPlayed = false;
    if (fen) {
        initGameFromFen(fen);
    } else {
        initGame();
    }
}

/**
 * Initializes a new game from the starting position.
 */
function initGame() {
    stopTimer();
    exitReviewMode();
    game.reset();

    whiteTime = gameTime.base * 60 * 1000;
    blackTime = gameTime.base * 60 * 1000;
    gameActive = true;
    isStockfishThinking = false;
    isLiveAnalyzing = false;
    pendingPremove = null;
    pendingMove = null;
    moveAnalysisData = [];
    capturedByWhite = [];
    capturedByBlack = [];
    userShapes = [];

    removeSquareHighlights();
    selectedSquare = null;
    buildBoard('start');
    updatePlayerLabels();
    updateEvalBar(0);
    showLiveGameView();
    updateGameState();
    playSound('gameStart');

    setTimeout(() => { if (board) board.resize(); }, 100);

    if (game.turn() === aiPlayer) {
        setTimeout(makeAiMove, 500);
    }
    startTimer();
}

/**
 * Initializes a new game from a FEN string.
 */
function initGameFromFen(fen) {
    if (!game.load(fen)) {
        console.error("Invalid FEN provided:", fen);
        Swal.fire('Error', 'The provided FEN string is invalid.', 'error');
        return;
    }
    stopTimer();
    exitReviewMode();
    whiteTime = gameTime.base * 60 * 1000;
    blackTime = gameTime.base * 60 * 1000;
    gameActive = true;
    isStockfishThinking = false;
    isLiveAnalyzing = false;
    pendingPremove = null;
    moveAnalysisData = [];
    capturedByWhite = [];
    capturedByBlack = [];
    userShapes = [];

    removeSquareHighlights();
    selectedSquare = null;
    buildBoard(game.fen());
    updatePlayerLabels();
    updateEvalBar(0);
    showLiveGameView();
    updateGameState();
    playSound('notify');

    setTimeout(() => { if (board) board.resize(); }, 100);

    if (game.turn() === aiPlayer) {
        setTimeout(makeAiMove, 500);
    }
    startTimer();
}

/**
 * Central function to update all UI components based on the current game state.
 */
function updateGameState() {
    // This is the main UI refresh function. It should not contain game logic itself.
    redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);
    updateStatus();
    updateCapturedPieces();
    updateMoveHistoryDisplay();
    updateOpeningName();
    updateThreatHighlights();
    updateOpeningExplorer();
    updateClockDisplay();
    updateNavButtons();

    // Check for game over *after* UI has been updated with the final position
    if (game.game_over()) {
        if (gameActive) {
            endGame();
        }
        return; // Halt further actions if the game is over
    }

    // Trigger next logical step (either AI move or background analysis)
    if (reviewMoveIndex === null && game.history().length > 0) {
        analyzeLastMove();
    }

    if (game.turn() === aiPlayer && !isStockfishThinking && reviewMoveIndex === null) {
        makeAiMove();
    }
}

/**
 * Handles the logic for making a player's move, including promotions.
 */
function handleMove(from, to) {
    const moveData = { from, to };
    const piece = game.get(from);

    // Check for promotion
    if (piece && piece.type === 'p' && (to.charAt(1) === '8' || to.charAt(1) === '1')) {
        pendingMove = moveData;
        showPromotionDialog(humanPlayer, (selectedPiece) => {
            pendingMove.promotion = selectedPiece;
            const finalMove = game.move(pendingMove); // Make the move in the logic
            if (finalMove) {
                // Let chessboard.js animation handle the visual update, then process the result
                processMoveResult(finalMove, false);
            }
            pendingMove = null;
        });
    } else {
        const finalMove = game.move(moveData); // Make the move in the logic
        if (finalMove) {
            // Let chessboard.js animation handle the visual update
            processMoveResult(finalMove, false);
        }
    }
}

/**
 * Processes the result of a move *after* it has been made in the chess.js logic.
 * @param {object} moveResult - The move object returned from chess.js.
 * @param {boolean} isOpponentMove - True if the AI made the move.
 */
function processMoveResult(moveResult, isOpponentMove) {
    stopTimer();
    const playerWhoMoved = isOpponentMove ? aiPlayer : humanPlayer;

    // Reset transient states
    isStockfishThinking = false;
    selectedSquare = null;
    userShapes = [];

    // Update captured pieces array
    if (moveResult.captured) {
        const capturedPiece = { type: moveResult.captured, color: playerWhoMoved === 'w' ? 'b' : 'w' };
        if (playerWhoMoved === 'w') capturedByWhite.push(capturedPiece);
        else capturedByBlack.push(capturedPiece);
    }

    addIncrement(playerWhoMoved);
    playMoveSound(moveResult, isOpponentMove);
    updateGameState(); // Refresh the entire UI and check for game over
    startTimer();

    // If a premove was made during the AI's turn, execute it now
    if (pendingPremove && gameActive) {
        setTimeout(executePremove, 50);
    }
}

/**
 * Attempts to execute a stored premove.
 */
function executePremove() {
    if (!pendingPremove) return;
    const { from, to } = pendingPremove;
    pendingPremove = null;
    removeSquareHighlights();

    const validPremove = game.moves({ verbose: true }).find(m => m.from === from && m.to === to);
    if (validPremove && game.turn() === humanPlayer) {
        handleMove(from, to);
    }
}

/**
 * Triggers a more powerful background analysis of the last move made.
 */
async function analyzeLastMove() {
    if (isLiveAnalyzing || !liveAnalysisStockfish) return;

    isLiveAnalyzing = true;
    const history = game.history({ verbose: true });
    if (history.length === 0) { isLiveAnalyzing = false; return; }

    const moveIndex = history.length - 1;
    const lastMove = history[moveIndex];

    moveAnalysisData[moveIndex] = { classification: 'Pending' };
    updateMoveHistoryDisplay();

    const undoneMove = game.undo();
    if (!undoneMove) { isLiveAnalyzing = false; return; }
    const fenBefore = game.fen();
    game.move(undoneMove.san); // Redo move

    // Get richer evaluation data, including the best line
    const analysisResult = await getLiveEvaluation(fenBefore);
    const evalAfter = await getLiveEvaluation(game.fen());

    const evalBeforePlayer = (lastMove.color === 'w') ? analysisResult.score : -analysisResult.score;
    const evalAfterPlayer = (lastMove.color === 'w') ? evalAfter.score : -evalAfter.score;
    const cpl = Math.max(0, evalBeforePlayer - evalAfterPlayer);

    const opponentCpl = moveIndex > 0 && moveAnalysisData[moveIndex - 1] ? moveAnalysisData[moveIndex - 1].cpl || 0 : 0;
    const classification = classifyLiveMove(cpl, opponentCpl, game.pgn());
    
    // Store the rich data for the instant analysis review
    moveAnalysisData[moveIndex] = {
        classification,
        cpl,
        score: evalAfter.score,
        bestLineSan: analysisResult.bestLineSan,
        move: lastMove.san
    };

    console.log({ logType: 'analysis', move: lastMove.san, classification, cpl });
    updateMoveHistoryDisplay();
    isLiveAnalyzing = false;
}


/**
 * Handles the game-ending conditions.
 */
function endGame() {
    if (!gameActive) return; // Prevent this from running multiple times
    gameActive = false;
    isStockfishThinking = false;
    clearTimeout(engineTimeout);
    stopTimer();
    showGameOverView();
    playSound('gameEnd');
    console.log({ logType: 'info', text: `Game Over. Result: ${getGameResult()}` });
}

/**
 * Ends the game due to a player running out of time.
 */
function endGameByFlag(loserColor) {
    const winnerColor = loserColor === 'white' ? 'Black' : 'White';
    game.header('Result', winnerColor === 'White' ? '1-0' : '0-1');
    endGame(); // Call the main endGame function to handle cleanup
}

/**
 * Undoes the last turn. This is the definitive fix for the undo functionality.
 */
function undoLastTurn() {
    if (isStockfishThinking || game.history().length < 1) return;

    stopTimer();
    game.undo(); // Undo the player's last move

    // If the AI made a move, undo that as well
    if (game.turn() === aiPlayer && game.history().length > 0) {
        game.undo();
    }

    // Reset all transient states
    gameActive = true; // Game is no longer over
    isStockfishThinking = false;
    clearTimeout(engineTimeout);
    pendingPremove = null;
    removeSquareHighlights();
    
    // Rebuild captured pieces list from the new (shorter) history
    capturedByWhite = [];
    capturedByBlack = [];
    game.history({ verbose: true }).forEach(move => {
        if (move.captured) {
            const capturedPiece = { type: move.captured, color: move.color === 'w' ? 'b' : 'w' };
            if (move.color === 'w') capturedByWhite.push(capturedPiece);
            else capturedByBlack.push(capturedPiece);
        }
    });
    
    moveAnalysisData.length = game.history().length; // Prune analysis data

    // Force a full visual and state refresh
    board.position(game.fen());
    showLiveGameView();
    updateGameState();
    startTimer();
    console.log({ logType: 'info', text: `Undo successful.`});
}

/**
 * Enters history review mode at a specific move index.
 */
function showHistoryPosition() {
    if (reviewMoveIndex === null) return;
    const history = game.history({ verbose: true });
    if (reviewMoveIndex < 0 || reviewMoveIndex >= history.length) return;

    const tempGame = new Chess();
    for (let i = 0; i <= reviewMoveIndex; i++) { tempGame.move(history[i].san); }

    board.position(tempGame.fen());
    updateMoveHistoryDisplay();
    updateNavButtons();
    updateStatus();
    userShapes = [];
    redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);
}

/**
 * Exits history review mode and returns to the current game position.
 */
function exitReviewMode() {
    if (reviewMoveIndex === null) return;
    reviewMoveIndex = null;
    board.position(game.fen());
    updateGameState();
}

/**
 * Gets a text description of the game result.
 */
function getGameResult() {
    if (game.in_checkmate()) return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
    if (game.in_stalemate()) return "Stalemate";
    if (game.in_threefold_repetition()) return "Draw by Threefold Repetition";
    if (game.insufficient_material()) return "Draw by Insufficient Material";
    if (game.in_draw()) return "Draw by 50-move rule";
    return "Game Over";
}