// ===================================================================================
//  ANALYSIS-REVIEW.JS
//  Renders the analysis move list, summary, and details panel.
// ===================================================================================

const AnalysisReview = {
    // --- Element References ---
    moveListElement: $('#ar-analysis-move-list'),
    assessmentDetailsElement: $('#ar-move-assessment-details'),
    assessmentTitleElement: $('#ar-assessment-title'),
    assessmentCommentElement: $('#ar-assessment-comment'),
    reviewSummaryContainer: $('#review-summary-container'),
    whiteAccuracyElement: $('#ar-white-accuracy'),
    blackAccuracyElement: $('#ar-black-accuracy'),
    moveCountsContainer: $('#ar-move-counts'),
    retryMistakeBtn: $('#ar-retry-mistake-btn'),
    bestLineDisplay: $('#ar-best-line-display'),
    bestLineMoves: $('#ar-best-line-moves'),

    /**
     * Renders the entire professional, fixed-category move list as accordions.
     * This version uses event delegation instead of inline onclicks.
     */
    renderMoveList(gameHistory, reviewData) {
        // Defines the professional display order and styling for all categories.
        const allRatings = {
            'Brilliant': { label: 'Brilliant', color: 'classification-color-brilliant' },
            'Great': { label: 'Great Move', color: 'classification-color-great' },
            'Best': { label: 'Best Move', color: 'classification-color-best' },
            'Excellent': { label: 'Excellent', color: 'classification-color-excellent' },
            'Good': { label: 'Good', color: 'classification-color-good' },
            'Book': { label: 'Book', color: 'classification-color-book' },
            'Inaccuracy': { label: 'Inaccuracy', color: 'classification-color-inaccuracy' },
            'Mistake': { label: 'Mistake', color: 'classification-color-mistake' },
            'Blunder': { label: 'Blunder', color: 'classification-color-blunder' },
            'Miss': { label: 'Missed Opportunity', color: 'classification-color-miss' }
        };

        const groupedMoves = {};
        reviewData.forEach((review, index) => {
            if (!review) return; // Guard against undefined analysis data
            const classification = review.classification;
            if (!groupedMoves[classification]) {
                groupedMoves[classification] = [];
            }
            groupedMoves[classification].push({
                ...gameHistory[index],
                index: index
            });
        });

        let listHtml = '<div class="space-y-1">';

        for (const key in allRatings) {
            const ratingInfo = allRatings[key];
            const movesInCategory = groupedMoves[key] || [];
            const moveCount = movesInCategory.length;

            const moveItemsHtml = movesInCategory.map(m =>
                `<li class="text-gray-300 hover:bg-gray-700/50 p-1 rounded-md cursor-pointer flex justify-between items-center"
                     data-move-index="${m.index}"
                     data-move-from="${m.from}" 
                     data-move-to="${m.to}">
                    <span>${Math.floor(m.index / 2) + 1}${m.color === 'w' ? '.' : '...'} ${m.san}</span>
                 </li>`
            ).join('');

            listHtml += `
                <div class="p-2 rounded-md bg-inset">
                    <div class="accordion-header flex justify-between items-center cursor-pointer">
                        <span class="font-bold text-sm ${ratingInfo.color}">${ratingInfo.label}</span>
                        <div class="flex items-center space-x-3">
                            <span class="text-gray-400 font-mono text-sm">${moveCount}</span>
                            <span class="text-xs text-blue-500 hover:text-blue-300 deep-analysis-btn" data-deep-analysis-key="${key}">Deep</span>
                        </div>
                    </div>
                    <ul class="accordion-content mt-2 pl-2 border-l-2 border-gray-700/50 space-y-1" style="display: none;">
                        ${moveItemsHtml || '<li class="text-gray-500 text-xs pl-1">No moves in this category.</li>'}
                    </ul>
                </div>
            `;
        }

        listHtml += '</div>';
        this.moveListElement.html(listHtml);
    },

    /**
     * Renders the summary section with accuracies and move counts.
     */
    renderSummary(accuracy, moveCounts) {
        this.whiteAccuracyElement.text(accuracy.w + '%');
        this.blackAccuracyElement.text(accuracy.b + '%');
        
        let countsHtml = '';
        const displayOrder = ['Brilliant', 'Great', 'Best', 'Miss', 'Blunder', 'Mistake', 'Inaccuracy'];
        displayOrder.forEach(key => {
            const w_count = moveCounts.w[key] || 0;
            const b_count = moveCounts.b[key] || 0;
            if (w_count > 0 || b_count > 0) {
                const info = CLASSIFICATION_DATA[key];
                countsHtml += `<div class="text-right">${w_count}</div>
                               <div class="text-center font-bold ${info.color}" title="${info.title}">${info.icon} ${key}</div>
                               <div class="text-left">${b_count}</div>`;
            }
        });
        this.moveCountsContainer.html(countsHtml);
        this.reviewSummaryContainer.removeClass('hidden');
        
        // Ensure summaryAccuracy is defined before using it
        if (typeof summaryAccuracy !== 'undefined' && summaryAccuracy.length) {
            summaryAccuracy.find('div:first-child .font-bold').text(accuracy.w + '%');
            summaryAccuracy.find('div:last-child .font-bold').text(accuracy.b + '%');
        }
    },

    /**
     * Displays the detailed assessment for a single, selected move.
     */
    showMoveAssessment(moveIndex, reviewData, gameHistory) {
        const data = reviewData[moveIndex];
        if (!data) return; // Safety check

        const info = CLASSIFICATION_DATA[data.classification];
        if (!info) return; // Safety check

        this.assessmentTitleElement.text(info.title).attr('class', `text-lg font-bold ${info.color}`);
        this.assessmentCommentElement.text(info.comment);
        this.assessmentDetailsElement.removeClass('hidden');

        const isBadMove = data.classification === 'Mistake' || data.classification === 'Blunder';
        this.retryMistakeBtn.toggleClass('hidden', !isBadMove);

        const playedMove = gameHistory[moveIndex];
        if (playedMove) {
            this.assessmentCommentElement.append(`<br><span class="text-xs text-gray-400">You played: ${playedMove.san}</span>`);
        }

        if (data.bestLineSan && ['Mistake', 'Blunder', 'Inaccuracy', 'Miss'].includes(data.classification)) {
            this.bestLineMoves.text(data.bestLineSan);
            this.bestLineDisplay.removeClass('hidden');
        } else {
            this.bestLineDisplay.addClass('hidden');
        }
    },

    /**
     * Highlights the current move in the move list and ensures it's visible.
     */
    highlightMove(moveIndex) {
        this.moveListElement.find('.current-move-analysis').removeClass('current-move-analysis');
        const targetElement = this.moveListElement.find(`[data-move-index="${moveIndex}"]`);
        
        if (targetElement.length) {
            targetElement.addClass('current-move-analysis');
            const parentList = targetElement.closest('ul');
            
            // Ensure the parent accordion list is visible
            if (!parentList.is(':visible')) {
                parentList.slideDown(200);
            }
            
            // Scroll the main container to bring the highlighted element into view
            this.moveListElement.animate({
                scrollTop: targetElement.offset().top - this.moveListElement.offset().top + this.moveListElement.scrollTop()
            }, 300);
        }
    }
};