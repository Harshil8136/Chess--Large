// ===================================================================================
//  GAME.JS
//  This module is the core controller for the chess game. It manages the game
//  state using chess.js, handles board interactions from chessboard.js, and
//  orchestrates communication between the UI, sound, and engine modules.
// ===================================================================================

window.ChessApp = window.ChessApp || {};
ChessApp.game = (function() {
    'use strict';

    const App = ChessApp; // Shortcut to the global namespace

    // --- Private State ---

    let board = null;
    const game = new Chess();

    let gameActive = true;
    let humanPlayer = 'w';
    let aiPlayer = 'b';
    let playerName = 'Player';
    let aiDifficulty = 5;
    let isStockfishThinking = false;
    let highlightThreats = false;

    // Move handling state
    let pendingMove = null;
    let pendingPremove = null;
    let selectedSquare = null;
    let reviewMoveIndex = null;
    let engineTimeout = null;

    // --- Private Methods ---

    function buildBoard(position = 'start') {
        const config = {
            position,
            draggable: true,
            onDragStart,
            onDrop,
            onSquareClick,
            pieceTheme: App.config.PIECE_THEMES[App.ui.elements.pieceThemeSelector.val()],
            moveSpeed: 200
        };
        if (board) board.destroy();
        board = Chessboard('board', config);
        board.orientation(humanPlayer === 'w' ? 'white' : 'black');
    }
    
    function initGameFromFen(fen) {
        if (!game.load(fen)) {
            Swal.fire('Error', 'The provided FEN string is invalid.', 'error');
            return;
        }
        gameActive = true;
        isStockfishThinking = false;
        reviewMoveIndex = null;
        buildBoard(game.fen());
        updateGameState(false);
        App.sound.play('notify');
        if (game.turn() === aiPlayer) {
            requestAiMove();
        }
    }

    function updateGameState(updateBoardPosition = true) {
        if (updateBoardPosition && reviewMoveIndex === null) {
            board.position(game.fen());
        }

        const history = game.history({ verbose: true });
        App.ui.updateStatus(getUiStatus());
        App.ui.updateCapturedPieces(history);
        App.ui.updateMoveHistoryDisplay(history, reviewMoveIndex);
        App.ui.updateNavButtons(history.length, reviewMoveIndex);
        updateThreats();

        if (game.game_over()) {
            if (gameActive) endGame();
            return;
        }

        if (game.turn() === aiPlayer && !isStockfishThinking && reviewMoveIndex === null) {
            requestAiMove();
        }
    }

    function onDrop(source, target) {
        selectedSquare = null;
        if (reviewMoveIndex !== null) return;

        if (isStockfishThinking && game.turn() !== humanPlayer) {
            pendingPremove = { from: source, to: target };
            return 'snapback';
        }

        if (game.turn() !== humanPlayer) return 'snapback';
        const move = game.moves({ verbose: true }).find(m => m.from === source && m.to === target);
        if (!move) return 'snapback';
        handlePlayerMove(move);
    }

    function onSquareClick(square) {}

    function onDragStart(source, piece) {
        return gameActive && !game.game_over() &&
            reviewMoveIndex === null &&
            piece.startsWith(humanPlayer) &&
            (game.turn() === humanPlayer || isStockfishThinking);
    }

    function handlePlayerMove(move) {
        if (move.flags.includes('p') && (move.to.endsWith('8') || move.to.endsWith('1'))) {
            pendingMove = { from: move.from, to: move.to };
            App.ui.showPromotionDialog(humanPlayer, (promotionPiece) => {
                pendingMove.promotion = promotionPiece;
                makeMove(pendingMove);
                pendingMove = null;
            });
        } else {
            makeMove(move);
        }
    }
    
    function makeMove(move) {
        const moveResult = game.move(move);
        if (moveResult) {
            App.sound.playForMove(moveResult, game.in_check());
            updateGameState(false);
        }
        return moveResult;
    }

    function performAiMove(moveUci) {
        isStockfishThinking = false;
        clearTimeout(engineTimeout);

        const move = game.move(moveUci, { sloppy: true });
        if (move) {
            App.sound.playForMove(move, game.in_check());
            updateGameState(true);
        } else {
            console.error("Engine produced an illegal move:", moveUci);
        }
    }
    
    function requestAiMove() {
        if (!gameActive || game.game_over()) return;
        
        isStockfishThinking = true;
        App.ui.updateStatus(getUiStatus());

        const difficulty = App.config.DIFFICULTY_SETTINGS[aiDifficulty];

        if (difficulty.type === 'random') {
            const moves = game.moves();
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            setTimeout(() => performAiMove(randomMove), 300);
            return;
        }

        if (difficulty.type === 'greedy') {
            let bestMove = null;
            let maxVal = -1;
            game.moves({ verbose: true }).forEach(move => {
                let moveVal = 0;
                if (move.captured) moveVal = App.config.MATERIAL_POINTS[move.captured] || 0;
                if (moveVal > maxVal) { maxVal = moveVal; bestMove = move; }
            });
            if (!bestMove) {
                const moves = game.moves();
                bestMove = moves[Math.floor(Math.random() * moves.length)];
            }
            setTimeout(() => performAiMove(bestMove), 300);
            return;
        }

        App.engine.findBestMove(game.fen(), aiDifficulty);

        engineTimeout = setTimeout(() => {
            console.error("AI Timeout: Engine did not respond.");
            isStockfishThinking = false;
            updateGameState();
        }, 20000);
    }

    function endGame() {
        gameActive = false;
        isStockfishThinking = false;
        App.sound.play('gameEnd');
        App.ui.updateStatus(getUiStatus());
    }

    function getUiStatus() {
        let text = '';
        if (game.game_over()) {
            if (game.in_checkmate()) text = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
            else text = "Game is a draw.";
        } else {
            text = `${game.turn() === 'w' ? 'White' : 'Black'}'s Turn`;
            if (game.in_check()) text += ' (in Check)';
        }
        return {
            text,
            isThinking: isStockfishThinking,
            disableUndo: (game.turn() !== humanPlayer || reviewMoveIndex !== null || game.history().length < 2),
            disableHint: (game.turn() !== humanPlayer || reviewMoveIndex !== null)
        };
    }

    function updateThreats() {}

    // --- Public Methods ---

    function init() {
        console.log("Initializing Game Module...");
        App.engine.onBestMove(performAiMove);
        startNewGame();
    }
    
    function startNewGame() {
        game.reset();
        gameActive = true;
        isStockfishThinking = false;
        reviewMoveIndex = null;
        buildBoard('start');
        updateGameState(false);
        App.sound.play('gameStart');
    }

    function undoPlayerMove() {
        if (game.turn() === humanPlayer && game.history().length >= 2) {
            game.undo();
            game.undo();
            updateGameState();
        }
    }
    
    const history = {
        jumpTo: (index) => {
            if (index >= 0 && index < game.history().length) {
                reviewMoveIndex = index;
                const tempGame = new Chess();
                game.history({verbose: true}).slice(0, index + 1).forEach(m => tempGame.move(m.san));
                board.position(tempGame.fen());
                App.ui.updateNavButtons(game.history().length, reviewMoveIndex);
            }
        },
        first: () => history.jumpTo(0),
        prev: () => history.jumpTo(reviewMoveIndex > 0 ? reviewMoveIndex - 1 : 0),
        next: () => history.jumpTo(reviewMoveIndex < game.history().length - 1 ? reviewMoveIndex + 1 : reviewMoveIndex),
        last: () => {
            reviewMoveIndex = null;
            board.position(game.fen());
            updateGameState();
        }
    };

    // NEW: Function to handle returning to the main game from analysis
    function returnToGame(options = {}) {
        if (App.analysis && typeof App.analysis.stop === 'function') {
            App.analysis.stop();
        }
        if (options.fen) {
            initGameFromFen(options.fen);
        }
        App.ui.showView('main');
    }

    return {
        init,
        startNewGame,
        undoPlayerMove,
        history,
        returnToGame, // <-- Expose the new function
        getBoard: () => board,
        getHistory: () => game.history({ verbose: true }),
        getPlayerName: () => playerName,
        setPlayerName: (name) => { playerName = name; },
        getHumanColor: () => humanPlayer,
        setAiDifficulty: (level) => { aiDifficulty = level; },
        setThreatHighlighting: (isEnabled) => { highlightThreats = isEnabled; },
        rebuildBoard: () => buildBoard(game.fen()),
        updateThreats
    };

})();