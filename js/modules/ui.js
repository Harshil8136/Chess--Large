// ===================================================================================
//  UI.JS
//  This module manages all direct DOM manipulation, UI event handling (except for
//  the board itself), and visual updates.
// ===================================================================================

window.ChessApp = window.ChessApp || {};
ChessApp.ui = (function() {
    'use strict';

    const App = ChessApp; // Shortcut to the global namespace

    // --- Module State ---
    const elements = {}; // Cached jQuery selectors

    // --- Private Methods ---

    function cacheSelectors() {
        elements.boardElement = $('#board');
        elements.statusElement = $('#game-status');
        elements.openingNameElement = $('#opening-name');
        elements.themeSelector = $('#theme-selector');
        elements.pieceThemeSelector = $('#piece-theme-selector');
        elements.uiThemeSelector = $('#ui-theme-selector');
        elements.capturedByWhiteElement = $('#captured-by-white');
        elements.capturedByBlackElement = $('#captured-by-black');
        elements.restartButton = $('#restart-button');
        elements.swapSidesButton = $('#swap-sides-button');
        elements.undoButton = $('#undo-button');
        elements.playerNameElement = $('#player-name');
        elements.bottomPlayerNameElement = $('#bottom-player-name');
        elements.topPlayerNameElement = $('#top-player-name');
        elements.whiteAdvantageElement = $('#white-advantage');
        elements.blackAdvantageElement = $('#black-advantage');
        elements.moveHistoryLog = $('#move-history-log');
        elements.evalBarWhite = $('#eval-bar-white');
        elements.evalBarBlack = $('#eval-bar-black');
        elements.difficultySlider = $('#difficulty-slider');
        elements.eloDisplay = $('#elo-display');
        elements.soundToggle = $('#sound-toggle');
        elements.soundIcon = $('#sound-icon');
        elements.historyFirstBtn = $('#history-first');
        elements.historyPrevBtn = $('#history-prev');
        elements.historyNextBtn = $('#history-next');
        elements.historyLastBtn = $('#history-last');
        elements.runAnalysisBtn = $('#run-review-btn');
        elements.mainGameView = $('#main-game');
        elements.analysisRoomView = $('#analysis-room');
        elements.returnToGameBtn = $('#return-to-game-btn');
        elements.hintButton = $('#hint-button');
        elements.threatsToggle = $('#threats-toggle');
        elements.fenInput = $('#fen-input');
        elements.loadFenBtn = $('#load-fen-btn');
        elements.exportPgnBtn = $('#export-pgn-btn');
        elements.boardSvgOverlay = $('#board-svg-overlay');
        elements.focusModeToggle = $('#focus-mode-toggle');
        elements.analysisVisualizer = $('#analysis-visualizer');
        elements.visualizerCancelBtn = $('#visualizer-cancel-btn');
    }

    function populateSelectors() {
        App.config.THEMES.forEach(theme => {
            elements.themeSelector.append($('<option>', { value: theme.name, text: theme.displayName }));
        });
        Object.keys(App.config.PIECE_THEMES).forEach(themeName => {
            elements.pieceThemeSelector.append($('<option>', { value: themeName, text: themeName.charAt(0).toUpperCase() + themeName.slice(1) }));
        });
        App.config.UI_THEMES.forEach(theme => {
            elements.uiThemeSelector.append($('<option>', { value: theme.name, text: theme.displayName }));
        });
    }
    
    // --- Public Methods ---

    function init() {
        console.log("Initializing UI Module...");
        cacheSelectors();
        populateSelectors();
        logBox.init();
    }

    function loadSettings() {
        const savedUiTheme = localStorage.getItem('chessUiTheme') || 'charcoal';
        elements.uiThemeSelector.val(savedUiTheme);
        applyUiTheme(savedUiTheme);

        elements.themeSelector.val(localStorage.getItem('chessBoardTheme') || App.config.APP_CONFIG.DEFAULT_BOARD_THEME);
        elements.pieceThemeSelector.val(localStorage.getItem('chessPieceTheme') || App.config.APP_CONFIG.DEFAULT_PIECE_THEME);

        const playerName = localStorage.getItem('chessPlayerName') || 'Player';
        elements.playerNameElement.text(playerName);
        App.game.setPlayerName(playerName);

        const difficulty = parseInt(localStorage.getItem('chessDifficulty') || '5', 10);
        elements.difficultySlider.val(difficulty);
        elements.eloDisplay.text(App.config.DIFFICULTY_SETTINGS[difficulty]?.elo || 1200);
        App.game.setAiDifficulty(difficulty);

        const isMuted = App.sound.loadSettings();
        updateSoundIcon(isMuted);
        
        const highlightThreats = localStorage.getItem('chessHighlightThreats') === 'true';
        elements.threatsToggle.prop('checked', highlightThreats);
        App.game.setThreatHighlighting(highlightThreats);

        if (localStorage.getItem('chessFocusMode') === 'true') {
            toggleFocusMode();
        }
    }

    // NEW: Centralized function to control which main view is visible.
    function showView(viewName) {
        elements.mainGameView.addClass('hidden');
        elements.analysisRoomView.addClass('hidden');
        elements.analysisVisualizer.addClass('hidden');

        switch (viewName) {
            case 'main':
                elements.mainGameView.removeClass('hidden');
                break;
            case 'analysis':
                elements.analysisRoomView.removeClass('hidden');
                break;
            case 'visualizer':
                elements.analysisVisualizer.removeClass('hidden');
                break;
        }
    }
    
    function updateStatus(status) {
        if (status.isThinking) {
            elements.statusElement.text("AI is thinking...").addClass('thinking-animation');
        } else {
            elements.statusElement.text(status.text).removeClass('thinking-animation');
        }
        elements.undoButton.prop('disabled', status.disableUndo);
        elements.hintButton.prop('disabled', status.disableHint);
    }

    function updatePlayerLabels(humanPlayerColor, playerName) {
        const whitePlayer = humanPlayerColor === 'w' ? `${playerName} (White)` : 'AI (White)';
        const blackPlayer = humanPlayerColor === 'b' ? `${playerName} (Black)` : 'AI (Black)';
        elements.bottomPlayerNameElement.text(whitePlayer);
        elements.topPlayerNameElement.text(blackPlayer);
    }
    
    function updateCapturedPieces(history) {
        const pieceThemePath = App.config.PIECE_THEMES[elements.pieceThemeSelector.val()];
        if (!pieceThemePath) return;

        const capturedBy = { w: [], b: [] };
        history.forEach(move => {
            if (move.captured) {
                const capturedSide = move.color === 'w' ? 'w' : 'b';
                const pieceColor = move.color === 'w' ? 'b' : 'w';
                capturedBy[capturedSide].push({ type: move.captured, color: pieceColor });
            }
        });

        const pieceOrder = { p: 1, n: 2, b: 3, r: 4, q: 5 };
        const sortPieces = (pieces) => pieces.sort((a,b) => pieceOrder[a.type] - pieceOrder[b.type]);

        const buildHtml = (pieces) => pieces.map(p => 
            `<img src="${pieceThemePath.replace('{piece}', p.color + p.type.toUpperCase())}" class="captured-piece" />`
        ).join('');

        elements.capturedByWhiteElement.html(buildHtml(sortPieces(capturedBy.w)));
        elements.capturedByBlackElement.html(buildHtml(sortPieces(capturedBy.b)));

        const calculateAdvantage = (pieces) => pieces.reduce((acc, p) => acc + (App.config.MATERIAL_POINTS[p.type] || 0), 0);
        const whiteAdvantage = calculateAdvantage(capturedBy.w);
        const blackAdvantage = calculateAdvantage(capturedBy.b);
        const advantageDiff = whiteAdvantage - blackAdvantage;
        
        elements.whiteAdvantageElement.text(advantageDiff > 0 ? `+${advantageDiff}` : '');
        elements.blackAdvantageElement.text(advantageDiff < 0 ? `+${-advantageDiff}` : '');
    }

    function updateMoveHistoryDisplay(history, reviewMoveIndex) {
        elements.moveHistoryLog.empty().addClass('move-history-grid');
        for (let i = 0; i < history.length; i += 2) {
            const moveNum = (i / 2) + 1;
            const w_move = history[i];
            const b_move = history[i + 1];
            const isWhiteHighlighted = reviewMoveIndex === i;
            const isBlackHighlighted = b_move && reviewMoveIndex === i + 1;

            elements.moveHistoryLog.append(
                `<span class="text-center font-bold text-dark">${moveNum}</span>` +
                `<span class="move-span ${isWhiteHighlighted ? 'highlight-move' : ''}" data-move-index="${i}">${w_move.san}</span>` +
                (b_move ? `<span class="move-span ${isBlackHighlighted ? 'highlight-move' : ''}" data-move-index="${i + 1}">${b_move.san}</span>` : '<span></span>')
            );
        }
    }
    
    function showPromotionDialog(color, onPromote) {
        const pieceThemePath = App.config.PIECE_THEMES[elements.pieceThemeSelector.val()];
        const pieces = ['q', 'r', 'b', 'n'];
        const promotion_choices_html = pieces.map(p => 
            `<img src="${pieceThemePath.replace('{piece}', `${color}${p.toUpperCase()}`)}" data-piece="${p}" class="promotion-piece" style="cursor: pointer; padding: 5px; border-radius: 5px; width: 60px; height: 60px;" onmouseover="this.style.backgroundColor='#4a5568';" onmouseout="this.style.backgroundColor='transparent';" />`
        ).join('');

        Swal.fire({
            title: 'Promote to:',
            html: `<div style="display: flex; justify-content: space-around;">${promotion_choices_html}</div>`,
            showConfirmButton: false,
            allowOutsideClick: false,
            customClass: { popup: '!bg-stone-700', title: '!text-white' },
            willOpen: () => {
                $(Swal.getPopup()).on('click', '.promotion-piece', function() {
                    const piece = $(this).data('piece');
                    onPromote(piece);
                    Swal.close();
                });
            }
        });
    }

    function updateSoundIcon(isMuted) {
        const iconPath = isMuted ? App.config.ICON_PATHS.soundOff : App.config.ICON_PATHS.soundOn;
        elements.soundIcon.attr('src', iconPath);
    }
    
    function applyUiTheme(themeName) {
        const theme = App.config.UI_THEMES.find(t => t.name === themeName);
        if (!theme) {
            console.error(`UI Theme "${themeName}" not found.`);
            return;
        }
        for (const [key, value] of Object.entries(theme.colors)) {
            document.documentElement.style.setProperty(key, value);
        }
    }

    function showTab(tabId) {
        $('.tab-content').removeClass('active');
        $('.tab-button').removeClass('active');
        $(`#${tabId}-tab`).addClass('active');
        $(`[data-tab="${tabId}"]`).addClass('active');
    }

    function updateNavButtons(historyLen, reviewMoveIndex) {
        const isReviewing = reviewMoveIndex !== null;
        elements.exportPgnBtn.prop('disabled', historyLen === 0);
        elements.historyFirstBtn.prop('disabled', isReviewing ? reviewMoveIndex <= 0 : historyLen === 0);
        elements.historyPrevBtn.prop('disabled', isReviewing ? reviewMoveIndex <= 0 : historyLen === 0);
        elements.historyNextBtn.prop('disabled', !isReviewing || reviewMoveIndex >= historyLen - 1);
        elements.historyLastBtn.prop('disabled', !isReviewing);
    }
    
    const logBox = {
        isDragging: false, isResizing: false, offset: { x: 0, y: 0 },
        init: function() {
            const container = $('#log-box-container');
            const header = $('#log-box-header');
            const handle = $('#log-box-resize-handle');
            header.on('mousedown', (e) => {
                if ($(e.target).is('button, button *')) return;
                this.isDragging = true; const cOffset = container.offset();
                this.offset.x = e.clientX - cOffset.left; this.offset.y = e.clientY - cOffset.top;
            });
            handle.on('mousedown', (e) => { e.preventDefault(); this.isResizing = true; });
            $(document).on('mousemove', (e) => {
                if (this.isDragging) container.css({ top: e.clientY - this.offset.y, left: e.clientX - this.offset.x });
                if (this.isResizing) container.css({ width: e.clientX - container.offset().left, height: e.clientY - container.offset().top });
            }).on('mouseup', () => { this.isDragging = false; this.isResizing = false; });
            $('#log-box-clear').on('click', () => $('#log-box-content').empty());
            $('#log-box-close').on('click', () => this.toggle(false));
        },
        toggle: function(forceState) {
            const shouldShow = forceState !== undefined ? forceState : !$('#log-box-toggle').is(':checked');
            $('#log-box-container').toggleClass('hidden', !shouldShow);
            $('#log-box-toggle').prop('checked', shouldShow);
            if (shouldShow) console.log("Log box opened.");
        }
    };
    
    function handleDifficultyChange(e) {
        const difficulty = parseInt(e.target.value, 10);
        elements.eloDisplay.text(App.config.DIFFICULTY_SETTINGS[difficulty]?.elo || 1200);
        localStorage.setItem('chessDifficulty', difficulty);
        App.game.setAiDifficulty(difficulty);
    }

    function handleUiThemeChange() { const themeName = $(this).val(); applyUiTheme(themeName); localStorage.setItem('chessUiTheme', themeName); }
    function handleBoardThemeChange() { localStorage.setItem('chessBoardTheme', $(this).val()); App.game.rebuildBoard(); }
    function handlePieceThemeChange() { localStorage.setItem('chessPieceTheme', $(this).val()); App.game.rebuildBoard(); updateCapturedPieces(App.game.getHistory()); }
    function handleThreatsToggle() { const isEnabled = $(this).is(':checked'); localStorage.setItem('chessHighlightThreats', isEnabled); App.game.setThreatHighlighting(isEnabled); App.game.updateThreats(); }

    function editPlayerName() {
        Swal.fire({
            title: 'Enter your name', input: 'text', inputValue: App.game.getPlayerName(), showCancelButton: true, confirmButtonText: 'Save',
            customClass: { popup: '!bg-stone-800', title: '!text-white', input: '!text-black' },
            inputValidator: v => !v || v.trim().length === 0 ? 'Please enter a name!' : null
        }).then(result => {
            if (result.isConfirmed) {
                const newName = result.value.trim();
                localStorage.setItem('chessPlayerName', newName);
                App.game.setPlayerName(newName);
                elements.playerNameElement.text(newName);
                updatePlayerLabels(App.game.getHumanColor(), newName);
            }
        });
    }

    function showEngineLoadError() {
        $('aside').html(`<div class="text-red-400 font-bold text-center p-4">CRITICAL ERROR:<br>Could not load chess engine.<br><br>Please check your internet connection<br>and refresh the page.</div>`);
        Swal.fire({
            title: 'Engine Loading Failed', text: 'The chess engine could not be loaded. The application cannot continue.',
            icon: 'error', confirmButtonText: 'Refresh Page', allowOutsideClick: false
        }).then(() => { window.location.reload(); });
    }

    function toggleFocusMode() {
        $('body').toggleClass('focus-mode');
        localStorage.setItem('chessFocusMode', $('body').hasClass('focus-mode'));
        setTimeout(() => $(window).trigger('resize'), 50);
    }

    function handleResize() {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            const board = App.game.getBoard();
            if (board) board.resize();
            // syncSidebarHeight();
            // Redraw any arrows/highlights
        }, 150);
    }
    
    return {
        init, loadSettings, elements, logBox, showView, updateStatus, updatePlayerLabels,
        updateCapturedPieces, updateMoveHistoryDisplay, showPromotionDialog,
        updateSoundIcon, applyUiTheme, showTab, updateNavButtons, handleDifficultyChange,
        handleUiThemeChange, handleBoardThemeChange, handlePieceThemeChange, handleThreatsToggle,
        editPlayerName, showEngineLoadError, toggleFocusMode, handleResize,
    };

})();