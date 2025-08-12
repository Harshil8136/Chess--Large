// ===================================================================================
//  ANALYSIS-EVAL.JS
//  Contains logic for move classification and accuracy calculation.
// ===================================================================================

function classifyLiveMove(cpl, opponentCpl, pgn) {
    const moveNumber = (pgn.match(/\d+\./g) || []).length;
    if (moveNumber <= 10 && OPENINGS.some(o => pgn.trim().startsWith(o.pgn))) return 'Book';
    if (opponentCpl > 150 && cpl > 70) return 'Miss';
    if (cpl >= 300) return 'Blunder';
    if (cpl >= 120) return 'Mistake';
    if (cpl >= 50) return 'Inaccuracy';
    if (cpl < 10) return 'Best';
    if (cpl < 30) return 'Excellent';
    return 'Good';
}

function classifyReviewedMove(cpl, opponentCpl, bestMoveAdvantage, pgn) {
    const moveNumber = (pgn.match(/\d+\./g) || []).length;
    if (moveNumber <= 10 && OPENINGS.some(o => pgn.trim().startsWith(o.pgn))) return 'Book';
    if (opponentCpl > 150 && cpl > 70) return 'Miss';
    if (cpl < 10 && bestMoveAdvantage > 250) return 'Brilliant';
    if (cpl < 10 && bestMoveAdvantage > 100) return 'Great';
    if (cpl >= 300) return 'Blunder';
    if (cpl >= 120) return 'Mistake';
    if (cpl >= 50) return 'Inaccuracy';
    if (cpl < 10) return 'Best';
    if (cpl < 30) return 'Excellent';
    return 'Good';
}

function calculateAccuracy(cpl_array) {
    if (cpl_array.length === 0) return 100;
    const avg_cpl = cpl_array.reduce((a, b) => a + b, 0) / cpl_array.length;
    return Math.max(0, Math.min(100, Math.round(103.16 * Math.exp(-0.04354 * avg_cpl))));
}