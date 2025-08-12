// ===================================================================================
//  UI.JS
//  Manages general UI interactions, state, and feedback.
// ===================================================================================

// --- jQuery Element References ---
const statusElement = $('#game-status');
const openingNameElement = $('#opening-name');
const themeSelector = $('#theme-selector');
const pieceThemeSelector = $('#piece-theme-selector');
const uiThemeSelector = $('#ui-theme-selector');
const capturedByWhiteElement = $('#captured-by-white');
const capturedByBlackElement = $('#captured-by-black');
const restartButton = $('#restart-button');
const swapSidesButton = $('#swap-sides-button');
const undoButton = $('#undo-button');
const playerNameElement = $('#player-name');
const bottomPlayerNameElement = $('#bottom-player-name');
const topPlayerNameElement = $('#top-player-name');
const whiteAdvantageElement = $('#white-advantage');
const blackAdvantageElement = $('#black-advantage');
const moveHistoryLog = $('#move-history-log');
const evalBarWhite = $('#eval-bar-white');
const evalBarBlack = $('#eval-bar-black');
const difficultySlider = $('#difficulty-slider');
const eloDisplay = $('#elo-display');
const soundToggle = $('#sound-toggle');
const soundIcon = $('#sound-icon');
const historyFirstBtn = $('#history-first');
const historyPrevBtn = $('#history-prev');
const historyNextBtn = $('#history-next');
const historyLastBtn = $('#history-last');
const runAnalysisBtn = $('#run-review-btn');
const mainGameView = $('#main-game');
const analysisRoomView = $('#analysis-room');
const returnToGameBtn = $('#return-to-game-btn');
const logBoxToggle = $('#log-box-toggle');
const logBoxContainer = $('#log-box-container');
const logBoxHeader = $('#log-box-header');
const logBoxContent = $('#log-box-content');
const logBoxClearBtn = $('#log-box-clear');
const logBoxCloseBtn = $('#log-box-close');
const logBoxResizeHandle = $('#log-box-resize-handle');
const hintButton = $('#hint-button');
const threatsToggle = $('#threats-toggle');
const fenInput = $('#fen-input');
const loadFenBtn = $('#load-fen-btn');
const exportPgnBtn = $('#export-pgn-btn');
const openingExplorer = $('#opening-explorer');
const openingExplorerContent = $('#opening-explorer-content');
const focusModeToggle = $('#focus-mode-toggle');
const gameSummarySection = $('#game-summary-section');
const liveGameView = $('#live-game-view');
const summaryAccuracy = $('#summary-accuracy');
const logShortcutBtn = $('#log-shortcut-btn');
const topClockElement = $('#top-clock');
const bottomClockElement = $('#bottom-clock');
const timeControlSelector = $('#time-control-selector');
const showTimeControlModalToggle = $('#show-time-control-modal-toggle');


/**
 * Applies a UI theme by setting CSS variables on the root element.
 */
function applyUiTheme(themeName) {
    const theme = UI_THEMES.find(t => t.name === themeName);
    if (!theme) {
        console.error(`UI Theme "${themeName}" not found.`);
        return;
    }
    for (const [key, value] of Object.entries(theme.colors)) {
        document.documentElement.style.setProperty(key, value);
    }
}

/**
 * Switches the main view between different tabs (e.g., Moves, Settings).
 */
function showTab(tabId) {
    $('.tab-content').removeClass('active');
    $('.tab-button').removeClass('active');
    $(`#${tabId}-tab`).addClass('active');
    $(`[data-tab="${tabId}"]`).addClass('active');
}

/**
 * Updates the game status display (e.g., "White's Turn").
 */
function updateStatus() {
    if (reviewMoveIndex !== null) {
        statusElement.text(`Reviewing move ${Math.floor(reviewMoveIndex / 2) + 1}...`).removeClass('thinking-animation');
        return;
    }

    let text = "Game Over";
    if (gameActive) {
        const turn = game.turn() === 'w' ? 'White' : 'Black';
        text = isStockfishThinking ? "AI is thinking..." : `${turn}'s Turn`;
        if (game.in_check()) text += ' (in Check)';
    }

    statusElement.text(text);
    isStockfishThinking ? statusElement.addClass('thinking-animation') : statusElement.removeClass('thinking-animation');
}

/**
 * Updates the display of captured pieces and material advantage.
 */
function updateCapturedPieces() {
    const pieceThemePath = PIECE_THEMES[pieceThemeSelector.val()];
    if (!pieceThemePath) return;

    const pieceOrder = { p: 1, n: 2, b: 3, r: 4, q: 5 };
    capturedByWhite.sort((a, b) => pieceOrder[a.type] - pieceOrder[b.type]);
    capturedByBlack.sort((a, b) => pieceOrder[a.type] - pieceOrder[b.type]);

    capturedByWhiteElement.html(capturedByWhite.map(p => `<img src="${pieceThemePath.replace('{piece}', p.color + p.type.toUpperCase())}" class="captured-piece" />`).join(''));
    capturedByBlackElement.html(capturedByBlack.map(p => `<img src="${pieceThemePath.replace('{piece}', p.color + p.type.toUpperCase())}" class="captured-piece" />`).join(''));

    const whiteMatAdv = capturedByWhite.reduce((acc, p) => acc + (MATERIAL_POINTS[p.type] || 0), 0);
    const blackMatAdv = capturedByBlack.reduce((acc, p) => acc + (MATERIAL_POINTS[p.type] || 0), 0);
    const adv = whiteMatAdv - blackMatAdv;

    whiteAdvantageElement.text(adv > 0 ? `+${adv}` : '');
    blackAdvantageElement.text(adv < 0 ? `+${-adv}` : '');
}

/**
 * Updates the move history log in the UI.
 */
function updateMoveHistoryDisplay() {
    const history = game.history({ verbose: true });
    moveHistoryLog.empty().addClass('move-history-grid');

    for (let i = 0; i < history.length; i += 2) {
        const moveNum = (i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1];

        let whiteClassificationIcon = '';
        if (moveAnalysisData[i]) {
            const info = CLASSIFICATION_DATA[moveAnalysisData[i].classification] || CLASSIFICATION_DATA['Pending'];
            whiteClassificationIcon = `<span class="classification-icon font-bold text-sm ${info.color}" title="${info.title}">${info.icon}</span>`;
        }

        const whiteHighlight = (reviewMoveIndex === i) ? 'highlight-move' : '';
        const whiteMoveSpan = `<span class="move-span ${whiteHighlight} flex justify-between items-center gap-1" data-move-index="${i}"><span>${whiteMove.san}</span>${whiteClassificationIcon}</span>`;

        let blackMoveSpan = '<span></span>';
        if (blackMove) {
            let blackClassificationIcon = '';
            if (moveAnalysisData[i + 1]) {
                const info = CLASSIFICATION_DATA[moveAnalysisData[i + 1].classification] || CLASSIFICATION_DATA['Pending'];
                blackClassificationIcon = `<span class="classification-icon font-bold text-sm ${info.color}" title="${info.title}">${info.icon}</span>`;
            }
            const blackHighlight = (reviewMoveIndex === i + 1) ? 'highlight-move' : '';
            blackMoveSpan = `<span class="move-span ${blackHighlight} flex justify-between items-center gap-1" data-move-index="${i + 1}"><span>${blackMove.san}</span>${blackClassificationIcon}</span>`;
        }

        moveHistoryLog.append(`<span class="text-center font-bold text-dark">${moveNum}</span>`, whiteMoveSpan, blackMoveSpan);
    }

    if (reviewMoveIndex === null && moveHistoryLog.length) {
        moveHistoryLog.scrollTop(moveHistoryLog[0].scrollHeight);
    }
    updateNavButtons();
}

/**
 * Updates the clock display for both players.
 */
function updateClockDisplay() {
    const isWhiteAtBottom = board ? board.orientation() === 'white' : true;
    const whiteClock = isWhiteAtBottom ? bottomClockElement : topClockElement;
    const blackClock = isWhiteAtBottom ? topClockElement : bottomClockElement;

    if (!gameTime || gameTime.base === 0) {
        whiteClock.html('&infin;').addClass('infinity').removeClass('clock-active low-time');
        blackClock.html('&infin;').addClass('infinity').removeClass('clock-active low-time');
        return;
    }

    whiteClock.removeClass('infinity');
    blackClock.removeClass('infinity');

    const formatTime = (ms) => {
        if (ms <= 0) return "0:00.0";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (ms < 10000) {
            const tenths = Math.floor((ms % 1000) / 100);
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    whiteClock.text(formatTime(whiteTime));
    blackClock.text(formatTime(blackTime));

    whiteClock.toggleClass('clock-active', gameActive && game.turn() === 'w').toggleClass('low-time', whiteTime < 20000);
    blackClock.toggleClass('clock-active', gameActive && game.turn() === 'b').toggleClass('low-time', blackTime < 20000);
}

/**
 * Updates the evaluation bar based on the engine's score.
 */
function updateEvalBar(score) {
    const evalPercentage = 50 * (1 + (2 / Math.PI) * Math.atan(score / 350));
    const clamped = Math.max(0.5, Math.min(99.5, evalPercentage));
    gsap.to(evalBarWhite, { height: `${clamped}%`, duration: 0.7, ease: 'power2.out' });
    gsap.to(evalBarBlack, { height: `${100 - clamped}%`, duration: 0.7, ease: 'power2.out' });
}

/**
 * Updates the enable/disable state of all navigation and action buttons.
 */
function updateNavButtons() {
    const historyLen = game.history().length;
    const isPlayerTurn = game.turn() === humanPlayer && gameActive;

    undoButton.prop('disabled', !gameActive || isStockfishThinking || historyLen < 1 || reviewMoveIndex !== null);
    hintButton.prop('disabled', !isPlayerTurn || isStockfishThinking || reviewMoveIndex !== null);
    exportPgnBtn.prop('disabled', historyLen === 0);
    swapSidesButton.prop('disabled', historyLen > 0);
    runAnalysisBtn.prop('disabled', historyLen === 0 || !game.game_over());

    if (reviewMoveIndex === null) {
        historyFirstBtn.prop('disabled', historyLen === 0);
        historyPrevBtn.prop('disabled', historyLen === 0);
        historyNextBtn.prop('disabled', true);
        historyLastBtn.prop('disabled', true);
    } else {
        historyFirstBtn.prop('disabled', reviewMoveIndex <= 0);
        historyPrevBtn.prop('disabled', reviewMoveIndex <= 0);
        historyNextBtn.prop('disabled', reviewMoveIndex >= historyLen - 1);
        historyLastBtn.prop('disabled', false);
    }
}

/**
 * Updates player name labels based on who is playing which color.
 */
function updatePlayerLabels() {
    bottomPlayerNameElement.text(humanPlayer === 'w' ? `${playerName} (White)` : `AI (White)`);
    topPlayerNameElement.text(humanPlayer === 'b' ? `${playerName} (Black)` : `AI (Black)`);
}

/**
 * Updates the opening name display based on the PGN.
 */
function updateOpeningName() {
    const pgn = game.pgn();
    let currentOpening = '';
    if (pgn) {
        for (let i = OPENINGS.length - 1; i >= 0; i--) {
            if (pgn.startsWith(OPENINGS[i].pgn)) {
                currentOpening = OPENINGS[i].name;
                break;
            }
        }
    }
    openingNameElement.text(currentOpening);
}

/**
 * Shows or hides the opening explorer panel.
 */
function updateOpeningExplorer() {
    const pgn = game.pgn();
    if (!pgn || game.history().length > 10) {
        openingExplorer.addClass('hidden');
        return;
    }
    const currentOpening = OPENINGS.find(o => pgn === o.pgn);
    if (currentOpening) {
        openingExplorerContent.text(currentOpening.name);
        openingExplorer.removeClass('hidden');
    } else {
        openingExplorer.addClass('hidden');
    }
}

/**
 * Shows the game over summary view and hides the live game view.
 */
function showGameOverView() {
    liveGameView.addClass('hidden');
    gameSummarySection.removeClass('hidden');
    summaryAccuracy.find('div:first-child .font-bold').text('--%');
    summaryAccuracy.find('div:last-child .font-bold').text('--%');
    updateNavButtons();
}

/**
 * Shows the live game view and hides the game over summary.
 */
function showLiveGameView() {
    liveGameView.removeClass('hidden');
    gameSummarySection.addClass('hidden');
}