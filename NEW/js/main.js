// ===================================================================================
//  MAIN.JS
//  Initializes the application, sets up event listeners, and loads the engine.
// ===================================================================================

/**
 * Main application initialization function.
 */
function initApp() {
    // --- Initial Setup ---
    initSounds();
    initLogBox();
    populateSelectors();
    loadSettings();
    setupEventListeners(); // All event listeners are now set up *after* all variables are loaded.

    // --- Initialize Chess Engine ---
    initEngine(
        (move) => {
            const moveResult = game.move(move, { sloppy: true });
            if (moveResult) {
                board.position(game.fen());
                processMoveResult(moveResult, true);
            }
        },
        () => {
            // This starts the first game *after* the engine is fully loaded.
            const key = localStorage.getItem('chessTimeControl') || APP_CONFIG.DEFAULT_TIME_CONTROL;
            const tc = TIME_CONTROLS[key] || TIME_CONTROLS[APP_CONFIG.DEFAULT_TIME_CONTROL];
            startNewGameWithTime(tc.base, tc.inc);
        },
        (error) => {
            $('aside').html(`<div class="text-red-400 font-bold text-center p-4">CRITICAL ERROR:<br>${error}<br><br>Please refresh the page.</div>`);
            Swal.fire({
                title: 'Engine Loading Failed', text: error, icon: 'error',
                confirmButtonText: 'Refresh Page', allowOutsideClick: false
            }).then(() => window.location.reload());
        }
    );
}

/**
 * Populates all the settings dropdowns.
 */
function populateSelectors() {
    THEMES.forEach(theme => themeSelector.append($('<option>', { value: theme.name, text: theme.displayName })));
    Object.keys(PIECE_THEMES).forEach(name => pieceThemeSelector.append($('<option>', { value: name, text: name.charAt(0).toUpperCase() + name.slice(1) })));
    UI_THEMES.forEach(theme => uiThemeSelector.append($('<option>', { value: theme.name, text: theme.displayName })));
    Object.keys(TIME_CONTROLS).forEach(key => timeControlSelector.append($('<option>', { value: key, text: TIME_CONTROLS[key].label })));
}

/**
 * Loads all user preferences from localStorage.
 */
function loadSettings() {
    const savedUiTheme = localStorage.getItem('chessUiTheme') || 'charcoal';
    uiThemeSelector.val(savedUiTheme);
    applyUiTheme(savedUiTheme);
    themeSelector.val(localStorage.getItem('chessBoardTheme') || APP_CONFIG.DEFAULT_BOARD_THEME);
    pieceThemeSelector.val(localStorage.getItem('chessPieceTheme') || APP_CONFIG.DEFAULT_PIECE_THEME);
    playerName = localStorage.getItem('chessPlayerName') || 'Player';
    playerNameElement.text(playerName);
    aiDifficulty = parseInt(localStorage.getItem('chessDifficulty') || '5', 10);
    difficultySlider.val(aiDifficulty);
    eloDisplay.text(DIFFICULTY_SETTINGS[aiDifficulty]?.elo || 1200);
    isMuted = localStorage.getItem('chessSoundMuted') === 'true';
    soundIcon.attr('src', isMuted ? 'icon/speaker-x-mark.png' : 'icon/speaker-wave.png');
    highlightThreats = localStorage.getItem('chessHighlightThreats') === 'true';
    threatsToggle.prop('checked', highlightThreats);
    showModalOnRestart = localStorage.getItem('chessShowModal') !== 'false';
    showTimeControlModalToggle.prop('checked', showModalOnRestart);
    timeControlSelector.val(localStorage.getItem('chessTimeControl') || APP_CONFIG.DEFAULT_TIME_CONTROL);
    if (localStorage.getItem('chessFocusMode') === 'true') {
        toggleFocusMode();
    }
}

/**
 * Attaches all global event listeners.
 */
function setupEventListeners() {
    // --- UI Element Clicks ---
    $('.tab-button').on('click', function() { showTab($(this).data('tab')); });
    restartButton.on('click', () => {
        if (showModalOnRestart) showTimeControlModal();
        else {
            const key = timeControlSelector.val();
            const tc = TIME_CONTROLS[key] || TIME_CONTROLS[APP_CONFIG.DEFAULT_TIME_CONTROL]; // Fallback added
            startNewGameWithTime(tc.base, tc.inc);
        }
    });
    undoButton.on('click', () => { if (!undoButton.prop('disabled')) undoLastTurn(); });
    swapSidesButton.on('click', () => {
        if (!swapSidesButton.prop('disabled')) {
            [humanPlayer, aiPlayer] = [aiPlayer, humanPlayer];
            initGame();
        } else {
             Swal.fire('Oops!', 'Can only swap sides at the start of a new game.', 'info');
        }
    });
    hintButton.on('click', showHint);
    runAnalysisBtn.on('click', () => {
        if (game.history().length > 0 && liveAnalysisStockfish) {
            window.gameDataToAnalyze = {
                pgn: game.pgn(),
                liveAnalysisData: moveAnalysisData,
                stockfish: liveAnalysisStockfish
            };
            AnalysisController.init();
        } else if (game.history().length === 0){
            Swal.fire('Error', 'No moves to analyze.', 'error');
        } else {
            Swal.fire('Error', 'Analysis engine is not available.', 'error');
        }
    });
    playerNameElement.on('click', editPlayerName);
    loadFenBtn.on('click', () => { const fen = fenInput.val().trim(); if (fen) { const tc = TIME_CONTROLS[timeControlSelector.val()]; startNewGameWithTime(tc.base, tc.inc, fen); } });
    exportPgnBtn.on('click', exportPgn);
    returnToGameBtn.on('click', () => AnalysisController.switchToMainGame());
    $('#show-shortcuts-btn').on('click', showShortcutsModal);
    logShortcutBtn.on('click', () => logBoxToggle.click());

    // --- Settings Changes ---
    uiThemeSelector.on('change', () => { applyUiTheme(uiThemeSelector.val()); localStorage.setItem('chessUiTheme', uiThemeSelector.val()); });
    themeSelector.on('change', () => { localStorage.setItem('chessBoardTheme', themeSelector.val()); buildBoard(game.fen()); });
    pieceThemeSelector.on('change', () => { localStorage.setItem('chessPieceTheme', pieceThemeSelector.val()); buildBoard(game.fen()); updateCapturedPieces(); });
    difficultySlider.on('input', e => { aiDifficulty = parseInt(e.target.value, 10); eloDisplay.text(DIFFICULTY_SETTINGS[aiDifficulty]?.elo || 1200); }).on('change', () => localStorage.setItem('chessDifficulty', aiDifficulty));
    soundToggle.on('click', toggleSound);
    threatsToggle.on('change', function() { highlightThreats = $(this).is(':checked'); localStorage.setItem('chessHighlightThreats', highlightThreats); updateThreatHighlights(); });
    focusModeToggle.on('click', toggleFocusMode);
    timeControlSelector.on('change', function() { localStorage.setItem('chessTimeControl', $(this).val()); });
    showTimeControlModalToggle.on('change', function() { showModalOnRestart = $(this).is(':checked'); localStorage.setItem('chessShowModal', showModalOnRestart); });

    // --- History Navigation ---
    historyFirstBtn.on('click', () => { if (!historyFirstBtn.prop('disabled')) { reviewMoveIndex = 0; showHistoryPosition(); } });
    historyPrevBtn.on('click', () => { if (!historyPrevBtn.prop('disabled')) { if (reviewMoveIndex === null) reviewMoveIndex = game.history().length; if (reviewMoveIndex > 0) reviewMoveIndex--; showHistoryPosition(); } });
    historyNextBtn.on('click', () => { if (!historyNextBtn.prop('disabled')) { if (reviewMoveIndex !== null && reviewMoveIndex < game.history().length - 1) reviewMoveIndex++; showHistoryPosition(); } });
    historyLastBtn.on('click', () => { if (!historyLastBtn.prop('disabled')) { exitReviewMode(); } });
    moveHistoryLog.on('click', '.move-span', function() { reviewMoveIndex = parseInt($(this).data('move-index')); showHistoryPosition(); });

    // --- Global Handlers ---
    $(document).on('keydown', handleKeyPress);
    $(window).on('resize', () => { clearTimeout(window.resizeTimer); window.resizeTimer = setTimeout(() => { if (board) { board.resize(); redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes); } }, 250); });
    boardElement.on('mousedown contextmenu', handleBoardRightClick);
    $(document).on('mouseup', handleDocumentMouseUp);
}

/**
 * Handles all non-input key presses for shortcuts. This is the definitive fix.
 */
function handleKeyPress(e) {
    if ($(e.target).is('input, select, textarea') || Swal.isVisible()) return;

    e.preventDefault();

    if (isAnalysisMode) {
        // --- ANALYSIS MODE SHORTCUTS ---
        let newIndex = AnalysisController.currentMoveIndex;
        switch(e.key) {
            case 'ArrowLeft': if(newIndex > 0) newIndex--; break;
            case 'ArrowRight': if(newIndex < AnalysisController.gameHistory.length - 1) newIndex++; break;
            case 'ArrowUp': newIndex = 0; break;
            case 'ArrowDown': newIndex = AnalysisController.gameHistory.length - 1; break;
            case 'f': AnalysisBoard.board.flip(); AnalysisBoard.renderCoordinates(); AnalysisBoard.redrawShapes(); return;
            default: return;
        }
        if (newIndex !== AnalysisController.currentMoveIndex) {
            AnalysisController.navigateToMove(newIndex);
            playSound('moveSelf');
        }
    } else {
        // --- GAME MODE SHORTCUTS ---
        const keyActionMap = {
            'n': restartButton, 'u': undoButton, 's': swapSidesButton,
            'm': soundToggle, 'h': hintButton, 'l': logShortcutBtn,
            'ArrowLeft': historyPrevBtn, 'ArrowRight': historyNextBtn,
            'ArrowUp': historyFirstBtn, 'ArrowDown': historyLastBtn,
            'Escape': focusModeToggle
        };

        const targetElement = keyActionMap[e.key];

        // This checks if the element exists AND if it's not disabled.
        if (targetElement && targetElement.length && !targetElement.prop('disabled')) {
            targetElement.click();
        } else if (e.key === 'f' && board) {
            board.flip();
            renderCoordinates(board.orientation());
            redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);
        }
    }
}


/**
 * Shows a hint arrow for the best move, now with safe event handling.
 */
function showHint() {
    if (hintButton.prop('disabled') || !stockfish) return;
    const originalOnMessage = stockfish.onmessage; // Safely store the original handler
    const originalShapes = [...userShapes];
    userShapes = [];

    const hintListener = (event) => {
        const message = event.data;
        if (message.startsWith('bestmove')) {
            const move = message.split(' ')[1];
            userShapes.push({ type: 'arrow', from: move.substring(0, 2), to: move.substring(2, 4), color: 'rgba(255, 165, 0, 0.7)' });
            redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);
            setTimeout(() => {
                userShapes = originalShapes;
                redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);
            }, 3000);
            stockfish.onmessage = originalOnMessage; // Restore the original handler
        }
    };

    stockfish.onmessage = hintListener; // Temporarily assign the new handler
    stockfish.postMessage(`position fen ${game.fen()}`);
    stockfish.postMessage('go movetime 1000');
}

/**
 * Toggles focus mode, hiding side panels.
 */
function toggleFocusMode() {
    $('body').toggleClass('focus-mode');
    const isFocus = $('body').hasClass('focus-mode');
    localStorage.setItem('chessFocusMode', isFocus);
    setTimeout(() => { if (board) board.resize(); }, 50);
}

/**
 * Prompts the user to edit their name.
 */
function editPlayerName() {
    Swal.fire({
        title: 'Enter your name', input: 'text', inputValue: playerName,
        showCancelButton: true, confirmButtonText: 'Save',
        customClass: { popup: '!bg-bg-panel', title: '!text-white', input: '!text-black !bg-gray-300' },
        inputValidator: v => !v || v.trim().length === 0 ? 'Please enter a name!' : null
    }).then(r => {
        if (r.isConfirmed && r.value) {
            playerName = r.value.trim();
            localStorage.setItem('chessPlayerName', playerName);
            updatePlayerLabels();
        }
    });
}

/**
 * Exports the current game as a PGN file.
 */
function exportPgn() {
    if (exportPgnBtn.prop('disabled')) return;
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${Date.now()}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Handles right-click events on the board for drawing.
 */
function handleBoardRightClick(e) {
    if (e.which !== 3) return;
    e.preventDefault();
    removeSquareHighlights();
    selectedSquare = null;
    isDrawing = true;
    drawStartSquare = $(e.target).closest('[data-square]').data('square');
}

/**
 * Handles the mouseup event to finalize drawing shapes.
 */
function handleDocumentMouseUp(e) {
    if (isDrawing && e.which === 3) {
        e.preventDefault();
        const endSquare = $(e.target).closest('[data-square]').data('square');
        if (drawStartSquare && endSquare) {
            if (drawStartSquare === endSquare) {
                const existingIndex = userShapes.findIndex(s => s.type === 'highlight' && s.square === drawStartSquare);
                if (existingIndex > -1) userShapes.splice(existingIndex, 1);
                else userShapes.push({ type: 'highlight', square: drawStartSquare, color: 'green' });
            } else {
                const existingIndex = userShapes.findIndex(s => s.type === 'arrow' && s.from === drawStartSquare && s.to === endSquare);
                if (existingIndex > -1) userShapes.splice(existingIndex, 1);
                else userShapes.push({ type: 'arrow', from: drawStartSquare, to: endSquare, color: 'rgba(21, 128, 61, 0.7)' });
            }
        } else {
            userShapes = [];
        }
        redrawUserShapes(boardElement, boardSvgOverlay, board, userShapes);
        isDrawing = false;
        drawStartSquare = null;
    }
}

// --- App Start ---
$(document).ready(initApp);