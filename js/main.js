// ===================================================================================
//  MAIN.JS
//  This is the primary entry point for the application. It initializes all
//  modules and connects UI events to their corresponding functions.
// ===================================================================================

// Initialize the global namespace
window.ChessApp = window.ChessApp || {};

// Use a self-executing function to encapsulate the main logic
(function(App) {
    'use strict';

    /**
     * The main application initializer. This function is called once the DOM is ready.
     */
    function initApp() {
        // --- 1. Initialize Core Modules ---
        // These modules prepare their internal state but don't need to wait for others.
        App.sound.init(); // Pre-loads all sound files.
        App.ui.init();    // Caches jQuery selectors, populates dropdowns, and sets up the log box.

        // --- 2. Wire Up All UI Event Handlers ---
        // This section connects every clickable/changeable element to a function in a dedicated module.

        // Top action buttons
        App.ui.elements.restartButton.on('click', App.game.startNewGame);
        App.ui.elements.soundToggle.on('click', App.sound.toggleMute);
        App.ui.elements.hintButton.on('click', App.game.showHint);
        App.ui.elements.undoButton.on('click', App.game.undoPlayerMove);
        App.ui.elements.focusModeToggle.on('click', App.ui.toggleFocusMode);

        // Main tabs
        $('.tab-button').on('click', function() { App.ui.showTab($(this).data('tab')); });

        // Move History & PGN
        App.ui.elements.historyFirstBtn.on('click', () => App.game.history.first());
        App.ui.elements.historyPrevBtn.on('click', () => App.game.history.prev());
        App.ui.elements.historyNextBtn.on('click', () => App.game.history.next());
        App.ui.elements.historyLastBtn.on('click', () => App.game.history.last());
        App.ui.elements.moveHistoryLog.on('click', '.move-span', function() {
            const moveIndex = parseInt($(this).data('move-index'));
            App.game.history.jumpTo(moveIndex);
        });
        App.ui.elements.exportPgnBtn.on('click', App.game.exportPgn);
        App.ui.elements.swapSidesButton.on('click', App.game.swapSides);

        // Settings Panel
        App.ui.elements.playerNameElement.on('click', App.ui.editPlayerName);
        App.ui.elements.difficultySlider.on('input', App.ui.handleDifficultyChange);
        App.ui.elements.uiThemeSelector.on('change', App.ui.handleUiThemeChange);
        App.ui.elements.themeSelector.on('change', App.ui.handleBoardThemeChange);
        App.ui.elements.pieceThemeSelector.on('change', App.ui.handlePieceThemeChange);
        App.ui.elements.threatsToggle.on('change', App.ui.handleThreatsToggle);
        App.ui.elements.logBoxToggle.on('change', () => App.ui.logBox.toggle());
        App.ui.elements.loadFenBtn.on('click', App.game.loadFen);

        // Analysis Flow
        App.ui.elements.runAnalysisBtn.on('click', App.analysis.start);
        App.ui.elements.visualizerCancelBtn.on('click', App.analysis.stop);
        App.ui.elements.returnToGameBtn.on('click', App.game.returnToGame);

        // Global Handlers
        $(document).on('keydown', App.ui.handleDocumentKeydown);
        App.ui.elements.boardElement.on('mousedown contextmenu', App.ui.handleBoardRightClick);
        $(document).on('mouseup', App.ui.handleDocumentMouseUp);

        // --- 3. Load Engine and Start the Game ---
        // This is the final, asynchronous step. The game cannot start until the engine is loaded.
        App.engine.init()
            .then(() => {
                // Once the engine is ready, load user settings from localStorage.
                App.ui.loadSettings();
                // Finally, initialize the game board and state.
                App.game.init();
            })
            .catch(error => {
                // If the engine fails to load for any reason, display a critical error.
                console.error('Fatal Error: Could not initialize chess engine.', error);
                App.ui.showEngineLoadError();
            });

        // Window resize handler
        $(window).on('resize', App.ui.handleResize);
    }

    // --- App Entry Point ---
    // The `initApp` function is called once the HTML document is fully loaded and ready.
    $(document).ready(initApp);

})(window.ChessApp);