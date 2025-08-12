// ===================================================================================
//  BOARD.JS
//  Manages the chessboard interface, interactions, and visual feedback.
// ===================================================================================

// --- Board State & Element References ---
let board = null;
let selectedSquare = null;
let userShapes = [];
let isDrawing = false;
let drawStartSquare = null;
const boardElement = $('#board');
const boardSvgOverlay = $('#board-svg-overlay');

/**
 * Initializes or re-initializes the chessboard.
 */
function buildBoard(position = 'start') {
    const selectedTheme = THEMES.find(t => t.name === themeSelector.val()) || THEMES[0];
    document.documentElement.style.setProperty('--light-square-color', selectedTheme.colors.light);
    document.documentElement.style.setProperty('--dark-square-color', selectedTheme.colors.dark);

    const config = {
        position,
        draggable: true,
        onDragStart,
        onDrop,
        onSnapEnd, // CRITICAL: Ensures board syncs after animation
        pieceTheme: PIECE_THEMES[pieceThemeSelector.val()],
        moveSpeed: 'fast'
    };

    if (board) board.destroy();
    board = Chessboard('board', config);

    boardElement.find('.square-55d63').off('click').on('click', function() {
        onSquareClick($(this).data('square'));
    });

    const orientation = humanPlayer === 'w' ? 'white' : 'black';
    board.orientation(orientation);
    renderCoordinates(orientation);
    redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);
}

/**
 * Renders the file and rank coordinates around the board.
 * @param {string} orientation - 'white' or 'black'.
 */
function renderCoordinates(orientation = 'white') {
    const isFlipped = orientation === 'black';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    if (isFlipped) { files.reverse(); } else { ranks.reverse(); }
    const filesHtml = files.map(f => `<span>${f}</span>`).join('');
    const ranksHtml = ranks.map(r => `<span>${r}</span>`).join('');

    $('#top-files').html(filesHtml);
    $('#bottom-files').html(filesHtml);
    $('#left-ranks').html(ranksHtml);
    $('#right-ranks').html(ranksHtml);
}

// --- Highlighting Functions ---
function removeSquareHighlights() {
    boardElement.find('.square-5d5d0').removeClass('highlight-legal highlight-selected premove-highlight');
}

function highlightLegalMoves(square) {
    removeSquareHighlights();
    const moves = game.moves({ square: square, verbose: true });
    if (moves.length === 0) return;

    boardElement.find(`.square-${square}`).addClass('highlight-selected');
    moves.forEach(move => {
        boardElement.find(`.square-${move.to}`).addClass('highlight-legal');
    });
}

function updateThreatHighlights() {
    boardElement.find('.square-5d5d0').removeClass('threatened-square');
    if (!highlightThreats || game.game_over() || reviewMoveIndex !== null) return;

    const threatenedPlayer = game.turn();
    const attackingPlayer = threatenedPlayer === 'w' ? 'b' : 'w';

    game.SQUARES.forEach(square => {
        const piece = game.get(square);
        if (piece && piece.color === threatenedPlayer) {
            if (game.attackers(square, attackingPlayer).length > 0) {
                boardElement.find(`[data-square=${square}]`).addClass('threatened-square');
            }
        }
    });
}

// --- Board Interaction Handlers ---
function onSquareClick(square) {
    if (isDrawing) return;

    if (reviewMoveIndex !== null) {
        selectedSquare = null;
        removeSquareHighlights();
        return;
    }

    if (game.turn() !== humanPlayer) {
        if (selectedSquare) {
            removeSquareHighlights();
            const premove = { from: selectedSquare, to: square };
            const isValid = game.moves({ verbose: true }).some(m => m.from === premove.from && m.to === premove.to);
            if (isValid) {
                pendingPremove = premove;
                $(`.square-${selectedSquare}`).addClass('premove-highlight');
                $(`.square-${square}`).addClass('premove-highlight');
                playSound('premove');
            } else {
                playSound('illegal');
            }
            selectedSquare = null;
        } else {
            const piece = game.get(square);
            if (piece && piece.color === humanPlayer) {
                selectedSquare = square;
                removeSquareHighlights();
                $(`.square-${square}`).addClass('premove-highlight');
            }
        }
        return;
    }

    const pieceOnSquare = game.get(square);

    if (selectedSquare) {
        const move = game.moves({ square: selectedSquare, verbose: true }).find(m => m.to === square);
        if (move) {
            handleMove(selectedSquare, square);
        } else {
            playSound('illegal');
        }
        selectedSquare = null;
        removeSquareHighlights();
    } else if (pieceOnSquare && pieceOnSquare.color === humanPlayer) {
        selectedSquare = square;
        highlightLegalMoves(square);
    }
}

function onDrop(source, target) {
    removeSquareHighlights();
    userShapes = [];
    redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);

    if (reviewMoveIndex !== null) return 'snapback';

    if (isStockfishThinking && game.turn() !== humanPlayer) {
        pendingPremove = { from: source, to: target };
        $(`.square-${source}`).addClass('premove-highlight');
        $(`.square-${target}`).addClass('premove-highlight');
        playSound('premove');
        return 'snapback';
    }

    if (game.turn() !== humanPlayer) return 'snapback';

    const move = game.moves({ verbose: true }).find(m => m.from === source && m.to === target);
    if (!move) {
        playSound('illegal');
        return 'snapback';
    }

    handleMove(source, target);
}

function onDragStart(source, piece) {
    if (selectedSquare) {
        removeSquareHighlights();
        selectedSquare = null;
    }
    return !isDrawing &&
           reviewMoveIndex === null &&
           gameActive &&
           piece.startsWith(humanPlayer) &&
           (game.turn() === humanPlayer || isStockfishThinking);
}

/**
 * Called after a piece snap animation is complete.
 * Ensures the board's visual state is perfectly in sync with the game logic.
 */
function onSnapEnd() {
    // This is the key to fixing the "two pieces" glitch. We only update the
    // board to the official game FEN *after* the animation is done.
    if (reviewMoveIndex === null) {
        board.position(game.fen());
    }
}