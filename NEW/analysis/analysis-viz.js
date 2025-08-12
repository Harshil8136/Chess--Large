// ===================================================================================
//  ANALYSIS-VIZ.JS
//  Controls the "Analyzing..." progress modal.
// ===================================================================================

const AnalysisVisualizer = {
    visualizerElement: $('#analysis-visualizer'),
    boardWrapper: $('#visualizer-board-wrapper'),
    statusElement: $('#visualizer-status'),
    moveNumberElement: $('#visualizer-move-number'),
    movePlayedElement: $('#visualizer-move-played'),
    moveAssessmentElement: $('#visualizer-move-assessment'),
    progressBar: $('#visualizer-progress-bar'),
    cancelBtn: $('#visualizer-cancel-btn'),
    board: null,

    initBoard() {
        if (this.board) this.board.destroy();
        this.board = Chessboard(this.boardWrapper.attr('id'), {
            position: 'start',
            pieceTheme: PIECE_THEMES[localStorage.getItem('chessPieceTheme') || 'alpha']
        });
    },

    show(onCancel) {
        this.initBoard();
        this.visualizerElement.removeClass('hidden');
        this.updateProgress(0);
        this.statusElement.text('Initializing engine...');
        this.moveNumberElement.text('--');
        this.movePlayedElement.text('--');
        this.moveAssessmentElement.text('--');
        this.cancelBtn.off('click').on('click', onCancel);
    },

    hide() {
        this.visualizerElement.addClass('hidden');
        if (this.board) {
            this.board.destroy();
            this.board = null;
        }
    },

    updateProgress(percent, statusText = '') {
        this.progressBar.css('width', `${percent}%`);
        if (statusText) {
            this.statusElement.text(statusText);
        }
    },

    updateMoveDetails(move, classification, moveIndex, totalMoves) {
        if (this.board) {
            const tempGame = new Chess();
            const history = window.AnalysisController.gameHistory;
            for (let i = 0; i < moveIndex; i++) {
                tempGame.move(history[i]);
            }
            this.board.position(tempGame.fen());
        }
        const status = `Analyzing move ${moveIndex + 1} of ${totalMoves}...`;
        this.statusElement.text(status);
        this.moveNumberElement.text(`${Math.floor(moveIndex / 2) + 1}${move.color === 'w' ? '.' : '...'}`);
        this.movePlayedElement.text(move.san);
        const info = CLASSIFICATION_DATA[classification];
        if (info) {
            this.moveAssessmentElement.text(info.title).attr('class', `font-bold ${info.color}`);
        }
    }
};