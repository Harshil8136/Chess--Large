// ===================================================================================
//  MAIN.JS
//  Initializes the application, sets up event listeners, and loads the engine.
// ===================================================================================

function initApp() {
    initSounds();
    initLogBox();
    
    // --- Event Listeners ---
    $('.tab-button').on('click', function() { showTab($(this).data('tab')); });
    restartButton.on('click', initGame);
    swapSidesButton.on('click', () => { if(gameActive && game.history().length === 0) {[humanPlayer, aiPlayer] = [aiPlayer, humanPlayer]; initGame();} else { Swal.fire('Oops!', 'Can only swap sides at the start of a new game.', 'info'); } });
    
    undoButton.on('click', () => {
        if (undoButton.prop('disabled')) return;
        removeLegalHighlights();
        selectedSquare = null;
        exitReviewMode();
        clearUserShapes();
        if (game.history().length >= 2) { game.undo(); game.undo(); }
        updateGameState(true);
    });
    
    historyFirstBtn.on('click', () => { if (!historyFirstBtn.prop('disabled')) { reviewMoveIndex = 0; showHistoryPosition(); } });
    historyPrevBtn.on('click', () => { if (!historyPrevBtn.prop('disabled')) { if (reviewMoveIndex === null) reviewMoveIndex = game.history().length - 1; if (reviewMoveIndex > 0) reviewMoveIndex--; else reviewMoveIndex = 0; showHistoryPosition(); } });
    historyNextBtn.on('click', () => { if (!historyNextBtn.prop('disabled')) { if (reviewMoveIndex === null) return; if (reviewMoveIndex < game.history().length - 1) reviewMoveIndex++; showHistoryPosition(); } });
    historyLastBtn.on('click', exitReviewMode);
    moveHistoryLog.on('click', '.move-span', function() { reviewMoveIndex = parseInt($(this).data('move-index')); showHistoryPosition(); });
    
    returnToGameBtn.on('click', switchToMainGame);
    
    runAnalysisBtn.on('click', function() {
        if ($(this).prop('disabled')) return;
        if (game.history().length === 0) { Swal.fire('Error', 'No moves to analyze.', 'error'); return; }
        if (!stockfish) { Swal.fire('Error', 'Chess engine not available.', 'error'); return; }

        analysisVisualizer.removeClass('hidden');
        
        window.gameDataToAnalyze = {
            pgn: game.pgn(),
            stockfish: stockfish,
            history: game.history({ verbose: true })
        };
        if (window.AnalysisController && typeof window.AnalysisController.init === 'function') {
            window.AnalysisController.init();
        } else {
            console.error('AnalysisController not available');
            Swal.fire('Error', 'Analysis system not loaded properly.', 'error');
            analysisVisualizer.addClass('hidden');
        }
    });
    
    visualizerCancelBtn.on('click', function() {
        analysisVisualizer.addClass('hidden');
        if (window.AnalysisController && typeof window.AnalysisController.stop === 'function') {
            window.AnalysisController.stop();
        }
    });

    hintButton.on('click', function() {
        if ($(this).prop('disabled')) return;
        
        const originalShapes = [...userShapes];
        clearUserShapes();

        let originalOnMessage = stockfish.onmessage;
        stockfish.postMessage(`position fen ${game.fen()}`);
        stockfish.postMessage('go movetime 1000');
        
        stockfish.onmessage = event => {
            const message = event.data;
            if (message.startsWith('bestmove')) {
                const move = message.split(' ')[1];
                const from = move.substring(0, 2);
                const to = move.substring(2, 4);
                drawArrow(from, to, 'rgba(255, 165, 0, 0.7)');
                
                setTimeout(() => {
                    userShapes = originalShapes;
                    redrawUserShapes();
                }, 3000);
                
                stockfish.onmessage = originalOnMessage;
            }
        };
    });

    loadFenBtn.on('click', () => {
        const fen = fenInput.val().trim();
        if (fen) initGameFromFen(fen);
        else Swal.fire('Info', 'Please paste a FEN string into the text field.', 'info');
    });
    
    exportPgnBtn.on('click', function() {
         if ($(this).prop('disabled')) return;
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
    });

    threatsToggle.on('change', function() {
        highlightThreats = $(this).is(':checked');
        localStorage.setItem('chessHighlightThreats', highlightThreats);
        updateThreatHighlights();
    });
    
    focusModeToggle.on('click', function() {
        $('body').toggleClass('focus-mode');
        localStorage.setItem('chessFocusMode', $('body').hasClass('focus-mode'));
        // After the sidebar is hidden/shown, update the layout.
        setTimeout(() => {
             $.fn.matchHeight._update();
        }, 50);
    });

    $('#main-game').on('click', function(e) {
        if ($('body').hasClass('focus-mode') && $(e.target).is(this)) {
            focusModeToggle.click();
        }
    });

    $(document).on('keydown', function(e) {
        if ($(e.target).is('input, select, textarea') || Swal.isVisible()) return;
        if (isAnalysisMode) return;

        switch (e.key.toLowerCase()) {
            case 'arrowleft': case 'a': historyPrevBtn.click(); break;
            case 'arrowright': case 'd': historyNextBtn.click(); break;
            case 'arrowup': case 'w': historyFirstBtn.click(); break;
            case 'arrowdown': case 's': historyLastBtn.click(); break;
            case 'f':
                board.flip();
                renderCoordinates();
                redrawUserShapes();
                break;
            case 'n': restartButton.click(); break;
            case 't': swapSidesButton.click(); break;
            case 'escape':
                if ($('body').hasClass('focus-mode')) {
                    focusModeToggle.click();
                }
                break;
            default: return;
        }
        e.preventDefault();
    });

    boardElement.on('mousedown contextmenu', function(e) {
        if (e.which !== 3) return;
        e.preventDefault();
        removeLegalHighlights();
        selectedSquare = null;
        isDrawing = true;
        drawStartSquare = $(e.target).closest('[data-square]').data('square');
    });

    $(document).on('mouseup', function(e) {
        if (isDrawing && e.which === 3) {
             e.preventDefault();
            const endSquare = $(e.target).closest('[data-square]').data('square');

            if (drawStartSquare && endSquare) {
                if (drawStartSquare === endSquare) {
                    const existingHighlightIndex = userShapes.findIndex(s => s.type === 'highlight' && s.square === drawStartSquare);
                    if (existingHighlightIndex > -1) userShapes.splice(existingHighlightIndex, 1);
                    else userShapes.push({ type: 'highlight', square: drawStartSquare, color: 'green' });
                } else {
                    const existingArrowIndex = userShapes.findIndex(s => s.type === 'arrow' && s.from === drawStartSquare && s.to === endSquare);
                     if (existingArrowIndex > -1) userShapes.splice(existingArrowIndex, 1);
                     else userShapes.push({ type: 'arrow', from: drawStartSquare, to: endSquare, color: 'rgba(21, 128, 61, 0.7)' });
                }
            } else {
                clearUserShapes();
            }
            
            redrawUserShapes();
            isDrawing = false;
            drawStartSquare = null;
        }
    });
    
    // --- Settings and Engine Loading ---
    themeSelector.on('change', () => { localStorage.setItem('chessBoardTheme', themeSelector.val()); buildBoard(game.fen()); });
    pieceThemeSelector.on('change', () => { localStorage.setItem('chessPieceTheme', pieceThemeSelector.val()); buildBoard(game.fen()); updateCapturedPieces()});
    difficultySlider.on('input', e => { aiDifficulty = parseInt(e.target.value, 10); eloDisplay.text(DIFFICULTY_SETTINGS[aiDifficulty]?.elo || 1200); localStorage.setItem('chessDifficulty', aiDifficulty); });
    soundToggle.on('click', () => { isMuted = !isMuted; localStorage.setItem('chessSoundMuted', isMuted); soundIcon.attr('src', isMuted ? 'icon/speaker-x-mark.png' : 'icon/speaker-wave.png'); });
    playerNameElement.on('click', () => { Swal.fire({ title: 'Enter your name', input: 'text', inputValue: playerName, showCancelButton: true, confirmButtonText: 'Save', customClass: { popup: '!bg-stone-800', title: '!text-white', input: '!text-black' }, inputValidator: v => !v || v.trim().length === 0 ? 'Please enter a name!' : null }).then(r => { if (r.isConfirmed) { playerName = r.value.trim(); localStorage.setItem('chessPlayerName', playerName); updatePlayerLabels(); } }); });

    UI_THEMES.forEach(theme => uiThemeSelector.append($('<option>', { value: theme.name, text: theme.displayName })));
    uiThemeSelector.on('change', () => {
        const selectedTheme = uiThemeSelector.val();
        applyUiTheme(selectedTheme);
        localStorage.setItem('chessUiTheme', selectedTheme);
    });

    fetch(APP_CONFIG.STOCKFISH_URL)
        .then(response => { 
            if (!response.ok) throw new Error(`Failed to fetch Stockfish: ${response.status} ${response.statusText}`); 
            return response.text(); 
        })
        .then(text => {
            try {
                stockfish = new Worker(URL.createObjectURL(new Blob([text], { type: 'application/javascript' })));
                stockfish.onmessage = event => {
                    const message = event.data;
                    if (!message.startsWith('info depth')) console.log(`Stockfish: ${message}`);
                    
                    if (message.startsWith('bestmove')) {
                        performMove(message.split(' ')[1]);
                    } else if (message.startsWith('info depth')) {
                        const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                        if (scoreMatch) {
                            let score = parseInt(scoreMatch[2], 10);
                            if (scoreMatch[1] === 'mate') score = (score > 0 ? 1 : -1) * APP_CONFIG.MATE_SCORE;
                            if (game.turn() === 'b') score = -score;
                            updateEvalBar(score);
                        }
                    }
                };
                stockfish.onerror = (error) => {
                    console.error('Stockfish Worker Error:', error);
                    Swal.fire('Engine Error', 'Chess engine encountered an error.', 'warning');
                };
                stockfish.postMessage('uci');
                stockfish.postMessage('isready');
            } catch (workerError) {
                console.error('Failed to create Stockfish worker:', workerError);
                throw workerError;
            }
            
            // Load settings from localStorage
            const savedUiTheme = localStorage.getItem('chessUiTheme') || 'charcoal';
            uiThemeSelector.val(savedUiTheme);
            applyUiTheme(savedUiTheme);
            if (localStorage.getItem('chessFocusMode') === 'true') {
                focusModeToggle.click();
            }
            highlightThreats = localStorage.getItem('chessHighlightThreats') === 'true';
            threatsToggle.prop('checked', highlightThreats);
            themeSelector.val(localStorage.getItem('chessBoardTheme') || APP_CONFIG.DEFAULT_BOARD_THEME);
            pieceThemeSelector.val(localStorage.getItem('chessPieceTheme') || APP_CONFIG.DEFAULT_PIECE_THEME);
            Object.keys(PIECE_THEMES).forEach(themeName => pieceThemeSelector.append($('<option>', { value: themeName, text: themeName.charAt(0).toUpperCase() + themeName.slice(1) })));
            THEMES.forEach(theme => themeSelector.append($('<option>', { value: theme.name, text: theme.displayName })));
            playerName = localStorage.getItem('chessPlayerName') || 'Player';
            playerNameElement.text(playerName);
            aiDifficulty = parseInt(localStorage.getItem('chessDifficulty') || '5', 10);
            difficultySlider.val(aiDifficulty);
            eloDisplay.text(DIFFICULTY_SETTINGS[aiDifficulty]?.elo || 1200);
            isMuted = localStorage.getItem('chessSoundMuted') === 'true';
            soundIcon.attr('src', isMuted ? 'icon/speaker-x-mark.png' : 'icon/speaker-wave.png');

            initGame();

            // Initial height sync after the board is ready
            syncSidebarHeight();
            $('.js-match-height').matchHeight();

        })
        .catch((error) => {
            console.error('Failed to load Stockfish:', error);
            $('aside').html(`<div class="text-red-400 font-bold text-center p-4">CRITICAL ERROR:<br>Could not load chess engine.<br><br>Please check your internet connection<br>and refresh the page.</div>`);
            Swal.fire({
                title: 'Engine Loading Failed',
                text: 'Could not load the chess engine.',
                icon: 'error',
                confirmButtonText: 'Refresh Page',
                allowOutsideClick: false
            }).then(() => {
                window.location.reload();
            });
        });
        
    $(window).on('resize', () => { 
        clearTimeout(window.resizeTimer); 
        window.resizeTimer = setTimeout(() => { 
            if(board) { 
                board.resize(); 
                redrawUserShapes();
                // Sync heights using both methods as requested
                syncSidebarHeight();
                $.fn.matchHeight._update();
            } 
        }, 150); 
    });
}

$(document).ready(initApp);