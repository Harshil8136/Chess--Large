// ===================================================================================
//  UI.JS
//  Manages general UI interactions, state, and feedback.
// ===================================================================================

// --- Element Refs ---
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
const summaryOpeningName = $('#summary-opening-name');
const summaryFinalMaterial = $('#summary-final-material');
const hintButton = $('#hint-button');
const threatsToggle = $('#threats-toggle');
const fenInput = $('#fen-input');
const loadFenBtn = $('#load-fen-btn');
const exportPgnBtn = $('#export-pgn-btn');
const openingExplorer = $('#opening-explorer');
const openingExplorerContent = $('#opening-explorer-content');
const focusModeToggle = $('#focus-mode-toggle');
const analysisVisualizer = $('#analysis-visualizer');
const visualizerCancelBtn = $('#visualizer-cancel-btn');

// --- UI State ---
let sounds = {};
let isMuted = false;
let playerName = 'Player';
let highlightThreats = false;

// --- Layout and UI Functions ---
function syncSidebarHeight() {
    const boardArea = document.getElementById('board-area-container');
    const sidebars = document.querySelectorAll('#main-game aside, #analysis-room aside');
    if (boardArea && sidebars.length) {
        if (window.innerWidth >= 1024 && !$('body').hasClass('focus-mode')) {
            requestAnimationFrame(() => {
                const boardHeight = boardArea.offsetHeight;
                sidebars.forEach(sidebar => { sidebar.style.height = `${boardHeight}px`; });
            });
        } else {
            sidebars.forEach(sidebar => { sidebar.style.height = 'auto'; });
        }
    }
}

function showTab(tabId) {
    $('.tab-content').removeClass('active');
    $('.tab-button').removeClass('active');
    $(`#${tabId}-tab`).addClass('active');
    $(`[data-tab="${tabId}"]`).addClass('active');
}

function switchToMainGame() {
    isAnalysisMode = false;
    analysisRoomView.addClass('hidden');
    mainGameView.removeClass('hidden');
    analysisVisualizer.addClass('hidden'); // Ensure visualizer is hidden
    if (window.AnalysisController && typeof window.AnalysisController.stop === 'function') {
        window.AnalysisController.stop();
    }
    if (window.loadFenOnReturn) {
        initGameFromFen(window.loadFenOnReturn);
        delete window.loadFenOnReturn;
    } else {
        runAnalysisBtn.prop('disabled', game.history().length === 0).text('Run Full Game Review');
    }
}

// Made globally accessible for analysis.js
window.switchToAnalysisRoom = function() {
    isAnalysisMode = true;
    mainGameView.addClass('hidden');
    analysisVisualizer.addClass('hidden');
    analysisRoomView.removeClass('hidden');
}

// --- Sound Functions ---
function initSounds() {
    Object.keys(SOUND_PATHS).forEach(key => {
        sounds[key] = new Howl({ src: [SOUND_PATHS[key]] });
    });
}

window.playSound = function(soundName) {
    if (isMuted) return;
    if (sounds[soundName]) sounds[soundName].play();
}

function playMoveSound(move) {
    if (move.flags.includes('p')) window.playSound('promote');
    else if (move.flags.includes('k') || move.flags.includes('q')) window.playSound('castle');
    else if (move.flags.includes('c')) window.playSound('capture');
    else window.playSound('moveSelf');
    if (game.in_check()) window.playSound('check');
}

// --- UI and Helper Functions ---
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

function updateEvalBar(score) {
    const evalPercentage = 50 * (1 + (2 / Math.PI) * Math.atan(score / 350));
    const clamped = Math.max(0.5, Math.min(99.5, evalPercentage));
    gsap.to(evalBarWhite, { height: `${clamped}%`, duration: 0.7, ease: 'power2.out' });
    gsap.to(evalBarBlack, { height: `${100 - clamped}%`, duration: 0.7, ease: 'power2.out' });
}

function updatePlayerLabels() {
    bottomPlayerNameElement.text(humanPlayer === 'w' ? `${playerName} (White)` : `AI (White)`);
    topPlayerNameElement.text(humanPlayer === 'b' ? `${playerName} (Black)` : `AI (Black)`);
}

function updateStatus() {
    if (reviewMoveIndex !== null) {
        undoButton.prop('disabled', true);
        hintButton.prop('disabled', true);
        return;
    }
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    let text = game.game_over() ? 'Game Over' : `${turn}'s Turn`;
    if (game.in_check()) text += ' (in Check)';
    if (!isStockfishThinking) statusElement.text(text).removeClass('thinking-animation');
    const isPlayerTurn = game.turn() === humanPlayer && gameActive;
    undoButton.prop('disabled', !isPlayerTurn || game.history().length < 2);
    hintButton.prop('disabled', !isPlayerTurn);
}

function updateCapturedPieces() {
    const pieceThemePath = PIECE_THEMES[pieceThemeSelector.val()];
    if (!pieceThemePath) return;
    const piecesCapturedByWhite = [];
    const piecesCapturedByBlack = [];
    game.history({ verbose: true }).forEach(move => { if (move.captured) { if (move.color === 'w') { piecesCapturedByWhite.push({ type: move.captured, color: 'b' }); } else { piecesCapturedByBlack.push({ type: move.captured, color: 'w' }); } } });
    const pieceOrder = { p: 1, n: 2, b: 3, r: 4, q: 5 };
    piecesCapturedByWhite.sort((a,b) => pieceOrder[a.type] - pieceOrder[b.type]);
    piecesCapturedByBlack.sort((a,b) => pieceOrder[a.type] - pieceOrder[b.type]);
    const whiteCapturedHtml = piecesCapturedByWhite.map(p => `<img src="${pieceThemePath.replace('{piece}', p.color + p.type.toUpperCase())}" class="captured-piece" />`).join('');
    const blackCapturedHtml = piecesCapturedByBlack.map(p => `<img src="${pieceThemePath.replace('{piece}', p.color + p.type.toUpperCase())}" class="captured-piece" />`).join('');
    capturedByWhiteElement.html(whiteCapturedHtml);
    capturedByBlackElement.html(blackCapturedHtml);
    const whiteMatAdv = piecesCapturedByWhite.reduce((acc, p) => acc + (MATERIAL_POINTS[p.type] || 0), 0);
    const blackMatAdv = piecesCapturedByBlack.reduce((acc, p) => acc + (MATERIAL_POINTS[p.type] || 0), 0);
    const adv = whiteMatAdv - blackMatAdv;
    whiteAdvantageElement.text(adv > 0 ? `+${adv}` : '');
    blackAdvantageElement.text(adv < 0 ? `+${-adv}` : '');
}

function updateMoveHistoryDisplay() {
    const history = game.history({ verbose: true });
    moveHistoryLog.empty().addClass('move-history-grid');
    for (let i = 0; i < history.length; i += 2) {
        const moveNum = (i / 2) + 1;
        const w_move = history[i];
        const b_move = history[i+1];
        const w_highlight = (reviewMoveIndex === i) ? 'highlight-move' : '';
        const b_highlight = (b_move && reviewMoveIndex === i+1) ? 'highlight-move' : '';
        moveHistoryLog.append(`<span class="text-center font-bold text-dark">${moveNum}</span>`);
        moveHistoryLog.append(`<span class="move-span ${w_highlight}" data-move-index="${i}">${w_move.san}</span>`);
        if (b_move) {
            moveHistoryLog.append(`<span class="move-span ${b_highlight}" data-move-index="${i+1}">${b_move.san}</span>`);
        } else {
            moveHistoryLog.append(`<span></span>`);
        }
    }
    if (reviewMoveIndex === null) {
       // Auto-scrolling disabled
    }
    updateNavButtons();
}

function showPromotionDialog(color) {
    const pieceThemePath = PIECE_THEMES[pieceThemeSelector.val()];
    const pieces = ['q', 'r', 'b', 'n'];
    const promotion_choices_html = pieces.map(p => `<img src="${pieceThemePath.replace('{piece}', `${color}${p.toUpperCase()}`)}" data-piece="${p}" class="promotion-piece" style="cursor: pointer; padding: 5px; border-radius: 5px; width: 60px; height: 60px;" onmouseover="this.style.backgroundColor='#4a5568';" onmouseout="this.style.backgroundColor='transparent';" />`).join('');
    Swal.fire({
        title: 'Promote to:', html: `<div style="display: flex; justify-content: space-around;">${promotion_choices_html}</div>`,
        showConfirmButton: false, allowOutsideClick: false, customClass: { popup: '!bg-stone-700', title: '!text-white' },
        willOpen: () => {
            $(Swal.getPopup()).on('click', '.promotion-piece', function() {
                if (pendingMove) {
                    pendingMove.promotion = $(this).data('piece');
                    performMove(pendingMove);
                    pendingMove = null;
                    Swal.close();
                }
            });
        }
    });
}

function updateGameSummary() {
    summaryOpeningName.text(`Opening: ${openingNameElement.text() || 'N/A'}`);
    const whiteAdv = whiteAdvantageElement.text();
    const blackAdv = blackAdvantageElement.text();
    let materialText = "Material: Even";
    if (whiteAdv) materialText = `Material: ${whiteAdv} for White`;
    if (blackAdv) materialText = `Material: ${blackAdv} for Black`;
    summaryFinalMaterial.text(materialText);
}

function initLogBox() {
    const originalConsole = { log: console.log, error: console.error, warn: console.warn };
    const logToBox = (message, type) => {
        if (logBoxContainer.is(':hidden')) return;
        let formattedMessage = '';
        try {
            formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
        } catch (e) { formattedMessage = '[[Unserializable Object]]'; }
        const timestamp = new Date().toLocaleTimeString();
        logBoxContent.append(`<div class="log-message ${type}"><span class="text-gray-500">${timestamp}:</span> ${formattedMessage}</div>`);
        logBoxContent.scrollTop(logBoxContent[0].scrollHeight);
    };
    console.log = function(message) { originalConsole.log.apply(console, arguments); logToBox(message, 'log-info'); };
    console.error = function(message) { originalConsole.error.apply(console, arguments); logToBox(message, 'log-error'); };
    console.warn = function(message) { originalConsole.warn.apply(console, arguments); logToBox(message, 'log-warn'); };
    logBoxToggle.on('change', function() { logBoxContainer.toggleClass('hidden', !this.checked); if (this.checked) console.log("Log box opened."); });
    logBoxClearBtn.on('click', () => logBoxContent.empty());
    logBoxCloseBtn.on('click', () => logBoxToggle.prop('checked', false).trigger('change'));
    
    let isDragging = false, offset = { x: 0, y: 0 };
    let isResizing = false;

    logBoxHeader.on('mousedown', function(e) {
        if ($(e.target).is('button') || $(e.target).parent().is('button')) return;
        isDragging = true;
        let containerOffset = logBoxContainer.offset();
        offset.x = e.clientX - containerOffset.left;
        offset.y = e.clientY - containerOffset.top;
    });

    logBoxResizeHandle.on('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
    });

    $(document).on('mousemove', function(e) {
        if (isDragging) {
            logBoxContainer.css({ top: e.clientY - offset.y, left: e.clientX - offset.x });
        }
        if (isResizing) {
            const containerOffset = logBoxContainer.offset();
            const newWidth = e.clientX - containerOffset.left;
            const newHeight = e.clientY - containerOffset.top;
            logBoxContainer.css({ width: `${newWidth}px`, height: `${newHeight}px` });
        }
    });

    $(document).on('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });
}

function applyUiTheme(themeName) {
    const theme = UI_THEMES.find(t => t.name === themeName);
    if (!theme) { console.error(`UI Theme "${themeName}" not found.`); return; }
    for (const [key, value] of Object.entries(theme.colors)) {
        document.documentElement.style.setProperty(key, value);
    }
}

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

function updateNavButtons() {
    const historyLen = game.history().length;
    exportPgnBtn.prop('disabled', historyLen === 0);
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