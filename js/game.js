// ===================================================================================
//  GAME.JS
//  Manages core game logic, state, and AI interaction.
// ===================================================================================

// --- Game State ---
const game = new Chess();
let gameActive = true;
let humanPlayer = 'w';
let aiPlayer = 'b';
let aiDifficulty = 5;
let pendingMove = null;
let pendingPremove = null;
let stockfish;
let isStockfishThinking = false;
let reviewMoveIndex = null;
let engineTimeout = null;
let isAnalysisMode = false;


// --- Core Game Functions ---
function initGame() {
    exitReviewMode();
    game.reset();
    gameActive = true;
    isStockfishThinking = false;
    pendingPremove = null;
    pendingMove = null;
    removePremoveHighlight();
    removeLegalHighlights();
    selectedSquare = null;
    clearUserShapes();
    buildBoard('start');
    updatePlayerLabels();
    updateEvalBar(0);
    updateGameState(false);
    window.playSound('gameStart');
    runAnalysisBtn.prop('disabled', true);
    $('#game-summary-section').addClass('hidden');
    showTab('moves');
    if (game.turn() === aiPlayer) {
        setTimeout(makeAiMove, 500);
    }
}

function initGameFromFen(fen) {
    console.log("Initializing game from FEN:", fen);
    exitReviewMode();
    if (!game.load(fen)) {
        console.error("Invalid FEN provided:", fen);
        Swal.fire('Error', 'The provided FEN string is invalid.', 'error');
        return;
    }
    gameActive = true;
    isStockfishThinking = false;
    pendingPremove = null;
    pendingMove = null;
    removePremoveHighlight();
    removeLegalHighlights();
    selectedSquare = null;
    clearUserShapes();
    buildBoard(game.fen());
    updatePlayerLabels();
    updateEvalBar(0);
    updateGameState(false);
    window.playSound('notify');
    runAnalysisBtn.prop('disabled', game.history().length === 0);
    $('#game-summary-section').addClass('hidden');
    showTab('moves');
    if (game.turn() === aiPlayer) {
        setTimeout(makeAiMove, 500);
    }
}

function updateGameState(updateBoard = true) {
    if (updateBoard && reviewMoveIndex === null) {
        board.position(game.fen());
        redrawUserShapes();
    }
    updateStatus();
    updateCapturedPieces();
    updateMoveHistoryDisplay();
    updateOpeningName();
    updateThreatHighlights();
    updateOpeningExplorer();

    if (!gameActive || game.game_over()) {
        if (gameActive) endGame();
        return;
    }
    if (game.turn() === aiPlayer && !isStockfishThinking && reviewMoveIndex === null) {
        makeAiMove();
    }
}

function endGame() {
    gameActive = false;
    isStockfishThinking = false;
    let msg = "";
    if (game.in_checkmate()) { msg = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`; }
    else { msg = "Game is a draw."; }
    statusElement.text(msg);
    window.playSound('gameEnd');
    runAnalysisBtn.prop('disabled', false);
    updateGameSummary();
    $('#game-summary-section').removeClass('hidden');
    showTab('analysis');
}

// --- Move Handling ---
function performMove(move) {
    removeLegalHighlights();
    selectedSquare = null;
    clearUserShapes();

    clearTimeout(engineTimeout);
    const moveResult = game.move(move, { sloppy: true });
    isStockfishThinking = false;
    if (moveResult) {
        playMoveSound(moveResult);
        updateGameState(true);
        if (pendingPremove && gameActive) setTimeout(executePremove, 50);
    }
}

function executePremove() {
    if (!pendingPremove) return;
    const move = pendingPremove;
    pendingPremove = null;
    removePremoveHighlight();
    const validPremove = game.moves({ verbose: true }).find(m => m.from === move.from && m.to === move.to);
    if (validPremove) {
        clearUserShapes();
        // We call game.move directly here instead of performMove to ensure the move is played instantly
        const moveResult = game.move(validPremove.san);
        if (moveResult) {
            playMoveSound(moveResult);
            updateGameState(true); // updateGameState will handle the AI's response
        }
    }
}

// --- AI Functions ---
function makeAiMove() {
    if (!gameActive || game.game_over()) return;
    isStockfishThinking = true;
    statusElement.text("AI is thinking...").addClass('thinking-animation');
    engineTimeout = setTimeout(() => {
        console.error("AI Timeout: Engine did not respond in 20 seconds.");
        isStockfishThinking = false;
        statusElement.text("AI Timeout. Can't move.").removeClass('thinking-animation');
        updateStatus();
    }, 20000);
    const difficulty = DIFFICULTY_SETTINGS[aiDifficulty];
    const fen = game.fen();
    console.log(`Sending to engine: position fen ${fen}`);
    stockfish.postMessage(`position fen ${fen}`);
    let goCommand = '';
    switch (difficulty.type) {
        case 'random':
            setTimeout(() => performMove(game.moves()[Math.floor(Math.random() * game.moves().length)]), 300);
            return;
        case 'greedy':
            let bestMove = null;
            let maxVal = -1;
            game.moves({ verbose: true }).forEach(move => {
                let moveVal = 0;
                if (move.captured) moveVal = MATERIAL_POINTS[move.captured] || 0;
                if (moveVal > maxVal) { maxVal = moveVal; bestMove = move; }
            });
            if (!bestMove) bestMove = game.moves({verbose: true})[Math.floor(Math.random() * game.moves().length)];
            setTimeout(() => performMove(bestMove.san), 300);
            return;
        case 'stockfish':
            if (difficulty.depth) goCommand = `go depth ${difficulty.depth}`;
            else if (difficulty.movetime) goCommand = `go movetime ${difficulty.movetime}`;
            break;
    }
    console.log(`Sending to engine: ${goCommand}`);
    stockfish.postMessage(goCommand);
}


// --- History Review Functions ---
function showHistoryPosition() {
    if (reviewMoveIndex === null) return;
    const history = game.history({ verbose: true });
    const tempGame = new Chess();
    for (let i = 0; i <= reviewMoveIndex; i++) { tempGame.move(history[i].san); }
    board.position(tempGame.fen());
    updateMoveHistoryDisplay();
    updateNavButtons();
    statusElement.text(`Reviewing move ${Math.floor(reviewMoveIndex / 2) + 1}...`);
    clearUserShapes();
}

function exitReviewMode() {
    if (reviewMoveIndex === null) return;
    reviewMoveIndex = null;
    board.position(game.fen());
    updateMoveHistoryDisplay();
    updateNavButtons();
    updateStatus();
    clearUserShapes();
}