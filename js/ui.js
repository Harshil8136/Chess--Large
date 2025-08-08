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
const gameSummarySection = $('#game-summary-section');
const liveGameView = $('#live-game-view');
const summaryAccuracy = $('#summary-accuracy');
const logShortcutBtn = $('#log-shortcut-btn');
const showShortcutsBtn = $('#show-shortcuts-btn');


// --- UI State ---
let sounds = {};
let isMuted = false;
let playerName = 'Player';
let highlightThreats = false;
let analysisStockfish = null; 

// --- Layout and UI Functions ---

// REMOVED: syncSidebarHeight() function.
// The jquery.matchHeight library is now the single source of truth for this,
// making the layout more stable and fixing bugs.

function showTab(tabId) {
    $('.tab-content').removeClass('active');
    $('.tab-button').removeClass('active');
    $(`#${tabId}-tab`).addClass('active');
    $(`[data-tab="${tabId}"]`).addClass('active');
}

function showLiveGameView() {
    liveGameView.removeClass('hidden');
    gameSummarySection.addClass('hidden');
}

function showGameOverView() {
    updateGameSummary();
    liveGameView.addClass('hidden');
    gameSummarySection.removeClass('hidden');
    runAnalysisBtn.prop('disabled', game.history().length === 0);
}


function switchToMainGame() {
    isAnalysisMode = false;
    analysisRoomView.addClass('hidden');
    mainGameView.removeClass('hidden');
    analysisVisualizer.addClass('hidden'); 
    
    if (window.AnalysisController && typeof window.AnalysisController.stop === 'function') {
        window.AnalysisController.stop();
    }
    
    if (window.loadFenOnReturn) {
        initGameFromFen(window.loadFenOnReturn);
        delete window.loadFenOnReturn;
    }
}

// ADDED: Function to display the shortcuts modal.
function showShortcutsModal() {
    const shortcutsHtml = `
        <div class="text-left text-lg space-y-2 text-light">
            <h3 class="text-2xl font-bold text-center mb-4">Keyboard Shortcuts</h3>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div class="font-semibold">New Game:</div><div class="font-mono bg-inset p-1 rounded text-center">N</div>
                <div class="font-semibold">Undo Move:</div><div class="font-mono bg-inset p-1 rounded text-center">U</div>
                <div class="font-semibold">Swap Sides:</div><div class="font-mono bg-inset p-1 rounded text-center">S</div>
                <div class="font-semibold">Flip Board:</div><div class="font-mono bg-inset p-1 rounded text-center">F</div>
                <div class="font-semibold">Toggle Sound:</div><div class="font-mono bg-inset p-1 rounded text-center">M</div>
                <div class="font-semibold">Show Hint:</div><div class="font-mono bg-inset p-1 rounded text-center">H</div>
                <div class="font-semibold">Toggle Debug Log:</div><div class="font-mono bg-inset p-1 rounded text-center">L</div>
                <div class="font-semibold">Toggle Focus Mode:</div><div class="font-mono bg-inset p-1 rounded text-center">Esc</div>
                <div class="font-semibold">History Navigation:</div><div class="font-mono bg-inset p-1 rounded text-center">← → ↑ ↓</div>
            </div>
        </div>
    `;
    Swal.fire({
        html: shortcutsHtml,
        showConfirmButton: true,
        confirmButtonText: 'Got it!',
        customClass: {
            popup: '!bg-bg-panel',
            confirmButton: '!btn-primary !px-6 !py-2'
        }
    });
}

function applyAnalysisLayout() {
    if (window.innerWidth < 1024) {
        $('#analysis-room').css({ display: 'flex', flexDirection: 'column' });
        return;
    };

    $('#analysis-room').css({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch'
    });
    $('#analysis-room > div:first-child').css({
        flex: '1 1 auto'
    });
    $('#analysis-room > aside').css({
        flex: '0 0 320px'
    });
}

window.switchToAnalysisRoom = function() {
    isAnalysisMode = true;
    mainGameView.addClass('hidden');
    analysisVisualizer.addClass('hidden');
    analysisRoomView.removeClass('hidden');
    
    applyAnalysisLayout();
    if ($.fn.matchHeight) {
        $.fn.matchHeight._update();
    }
};

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
        let w_classificationIcon = '';
        if (window.moveAnalysisData && window.moveAnalysisData[i]) {
            const classification = window.moveAnalysisData[i].classification;
            const info = CLASSIFICATION_DATA[classification] || CLASSIFICATION_DATA['Pending'];
            w_classificationIcon = `<span class="classification-icon font-bold text-sm ${info.color}" title="${info.title}">${info.icon}</span>`;
        }
        const w_highlight = (reviewMoveIndex === i) ? 'highlight-move' : '';
        const w_moveSpan = `
            <span class="move-span ${w_highlight} flex justify-between items-center gap-1" data-move-index="${i}">
                <span>${w_move.san}</span>
                ${w_classificationIcon}
            </span>`;

        const b_move = history[i + 1];
        let b_moveSpan = '<span></span>';
        if (b_move) {
            let b_classificationIcon = '';
            if (window.moveAnalysisData && window.moveAnalysisData[i+1]) {
                const classification = window.moveAnalysisData[i+1].classification;
                const info = CLASSIFICATION_DATA[classification] || CLASSIFICATION_DATA['Pending'];
                b_classificationIcon = `<span class="classification-icon font-bold text-sm ${info.color}" title="${info.title}">${info.icon}</span>`;
            }
            const b_highlight = (reviewMoveIndex === i + 1) ? 'highlight-move' : '';
            b_moveSpan = `
                <span class="move-span ${b_highlight} flex justify-between items-center gap-1" data-move-index="${i + 1}">
                    <span>${b_move.san}</span>
                    ${b_classificationIcon}
                </span>`;
        }
        
        moveHistoryLog.append(`<span class="text-center font-bold text-dark">${moveNum}</span>`);
        moveHistoryLog.append(w_moveSpan);
        moveHistoryLog.append(b_moveSpan);
    }

    if (reviewMoveIndex === null && moveHistoryLog.length) {
        moveHistoryLog.scrollTop(moveHistoryLog[0].scrollHeight);
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
    summaryAccuracy.find('div:first-child .font-bold').text('--%');
    summaryAccuracy.find('div:last-child .font-bold').text('--%');
}

function initLogBox() {
    const originalConsole = { log: console.log, error: console.error, warn: console.warn };
    
    const logToBox = (message, type) => {
        if (logBoxContainer.is(':hidden')) return;
        
        let content = '';
        const timestamp = `<span class="text-gray-500">${new Date().toLocaleTimeString()}:</span>`;

        if (typeof message === 'object' && message !== null && message.logType) {
            switch (message.logType) {
                case 'analysis':
                    const info = CLASSIFICATION_DATA[message.classification] || {};
                    content = `${timestamp} <span class="font-bold text-sky-400">[ANALYSIS]</span> Move <b>${message.move}</b> | CPL: ${message.cpl.toFixed(0)} | Class: <b class="${info.color || ''}">${message.classification}</b>`;
                    break;
                case 'engine_move':
                     content = `${timestamp} <span class="font-bold text-green-400">[AI MOVE]</span> Best move: <b>${message.move}</b> | Eval: ${message.eval}`;
                     break;
                case 'info':
                     content = `${timestamp} <span class="font-bold text-gray-400">[INFO]</span> ${message.text}`;
                     break;
                default:
                    content = `${timestamp} ${JSON.stringify(message)}`;
            }
        } else {
            let formattedMessage = '';
            try {
                formattedMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
            } catch (e) { formattedMessage = '[[Unserializable Object]]'; }
            content = `${timestamp} ${formattedMessage}`;
        }
        
        logBoxContent.append(`<div class="log-message ${type}">${content}</div>`);
        logBoxContent.scrollTop(logBoxContent[0].scrollHeight);
    };

    console.log = function() { originalConsole.log.apply(console, arguments); logToBox(arguments[0], 'log-info'); };
    console.error = function() { originalConsole.error.apply(console, arguments); logToBox(arguments[0], 'log-error'); };
    console.warn = function() { originalConsole.warn.apply(console, arguments); logToBox(arguments[0], 'log-warn'); };
    
    logBoxToggle.on('change', function() { logBoxContainer.toggleClass('hidden', !this.checked); if (this.checked) console.log({ logType: 'info', text: 'Debug log opened.' }); });
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