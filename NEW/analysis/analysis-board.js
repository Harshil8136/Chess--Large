// ===================================================================================
//  ANALYSIS-BOARD.JS
//  Manages the chessboard instance and drawings in the Analysis Room.
// ===================================================================================

const AnalysisBoard = {
    board: null,
    boardElement: $('#analysis-board'),
    svgOverlay: $('#analysis-board-svg-overlay'),
    userShapes: [],
    isDrawing: false,
    drawStartSquare: null,

    /**
     * Initializes the analysis board.
     */
    init() {
        const boardConfig = {
            position: 'start',
            pieceTheme: PIECE_THEMES[localStorage.getItem('chessPieceTheme') || 'alpha'],
            draggable: false,
        };
        if (this.board && typeof this.board.destroy === 'function') {
            this.board.destroy();
        }
        this.board = Chessboard('analysis-board', boardConfig);
        this.applyTheme();
        this.renderCoordinates();
        this.setupEventHandlers();
    },

    /**
     * Applies the current board theme to the analysis board.
     */
    applyTheme() {
        const themeName = localStorage.getItem('chessBoardTheme') || APP_CONFIG.DEFAULT_BOARD_THEME;
        const theme = THEMES.find(t => t.name === themeName);
        if (theme) {
            document.documentElement.style.setProperty('--light-square-color', theme.colors.light);
            document.documentElement.style.setProperty('--dark-square-color', theme.colors.dark);
        }
    },

    /**
     * Renders the file and rank coordinates around the analysis board.
     */
    renderCoordinates() {
        if (!this.board) return;
        const orientation = this.board.orientation();
        const isFlipped = orientation === 'black';
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        let ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
        if (isFlipped) { files.reverse(); } else { ranks.reverse(); }
        const filesHtml = files.map(f => `<span>${f}</span>`).join('');
        const ranksHtml = ranks.map(r => `<span>${r}</span>`).join('');

        $('#analysis-top-files').html(filesHtml);
        $('#analysis-bottom-files').html(filesHtml);
        $('#analysis-left-ranks').html(ranksHtml);
        $('#analysis-right-ranks').html(ranksHtml);
    },

    /**
     * Redraws all shapes on the board, including main analysis arrows and user shapes.
     */
    redrawShapes() {
        this.svgOverlay.empty();
        this.boardElement.find('.square-55d63').removeClass('highlight-user-green highlight-user-red highlight-user-yellow highlight-user-blue');
        
        if (!this.board || AnalysisController.currentMoveIndex < 0) return;

        // 1. Draw the main analysis arrows for the currently selected move
        const data = AnalysisController.reviewData[AnalysisController.currentMoveIndex];
        const move = AnalysisController.gameHistory[AnalysisController.currentMoveIndex];
        
        if (data && move) {
            // Draw the move that was actually played
            drawArrow(move.from, move.to, 'rgba(217, 119, 6, 0.7)', this.svgOverlay, this.board, this.boardElement);
            
            // If the move was a mistake, draw the best move arrow
            if (data.bestLineSan && ['Mistake', 'Blunder', 'Inaccuracy', 'Miss'].includes(data.classification)) {
                const tempGame = new Chess();
                for(let i=0; i < AnalysisController.currentMoveIndex; i++) tempGame.move(AnalysisController.gameHistory[i]);
                const bestMove = tempGame.move(data.bestLineSan.split(' ')[0]);
                if (bestMove) {
                    drawArrow(bestMove.from, bestMove.to, 'rgba(34, 197, 94, 0.7)', this.svgOverlay, this.board, this.boardElement);
                }
            }
        }
        
        // 2. Draw all user-added shapes on top
        redrawUserShapes(this.boardElement, this.svgOverlay, this.board, this.userShapes);
    },
    
    /**
     * Sets up mouse handlers for drawing on the board.
     */
    setupEventHandlers() {
        this.boardElement.off('mousedown contextmenu').on('mousedown contextmenu', (e) => {
            if (e.which !== 3) return; // Only for right-click
            e.preventDefault();
            this.isDrawing = true;
            this.drawStartSquare = $(e.target).closest('[data-square]').data('square');
        });

        $(document).off('mouseup.analysis_draw').on('mouseup.analysis_draw', (e) => {
            if (!this.isDrawing || e.which !== 3) return;
            e.preventDefault();
            const endSquare = $(e.target).closest('[data-square]').data('square');
            
            if (this.drawStartSquare && endSquare) {
                 if (this.drawStartSquare === endSquare) {
                    const existingIndex = this.userShapes.findIndex(s => s.type === 'highlight' && s.square === this.drawStartSquare);
                    if (existingIndex > -1) this.userShapes.splice(existingIndex, 1);
                    else this.userShapes.push({ type: 'highlight', square: this.drawStartSquare, color: 'green' });
                } else {
                    const existingIndex = this.userShapes.findIndex(s => s.type === 'arrow' && s.from === this.drawStartSquare && s.to === endSquare);
                    if (existingIndex > -1) this.userShapes.splice(existingIndex, 1);
                    else this.userShapes.push({ type: 'arrow', from: this.drawStartSquare, to: endSquare, color: 'rgba(21, 128, 61, 0.7)' });
                }
            } else {
                this.userShapes = []; // Clear shapes if clicking off-board
            }
            this.redrawShapes();
            this.isDrawing = false;
            this.drawStartSquare = null;
        });
    }
};