// ===================================================================================
//  TIMER.JS
//  Manages the game clock and time control logic.
// ===================================================================================

let timerInterval = null;
let whiteTime = 0;
let blackTime = 0;
let whiteTenSecondsWarningPlayed = false;
let blackTenSecondsWarningPlayed = false;


/**
 * Starts the game timer, clearing any existing interval.
 */
function startTimer() {
    if (timerInterval) stopTimer();
    if (gameTime && gameTime.base > 0) {
        timerInterval = setInterval(tick, 100);
    }
}

/**
 * Stops the game timer.
 */
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

/**
 * The main timer loop, called every 100ms. Decrements the current player's time.
 */
function tick() {
    if (!gameActive) {
        stopTimer();
        return;
    }

    const turn = game.turn();
    if (turn === 'w') {
        whiteTime -= 100;
        if (whiteTime < 10000 && !whiteTenSecondsWarningPlayed) {
            playSound('tenSeconds');
            whiteTenSecondsWarningPlayed = true;
        }
        if (whiteTime <= 0) {
            whiteTime = 0;
            updateClockDisplay();
            endGameByFlag('white');
        }
    } else {
        blackTime -= 100;
        if (blackTime < 10000 && !blackTenSecondsWarningPlayed) {
            playSound('tenSeconds');
            blackTenSecondsWarningPlayed = true;
        }
        if (blackTime <= 0) {
            blackTime = 0;
            updateClockDisplay();
            endGameByFlag('black');
        }
    }
    updateClockDisplay();
}

/**
 * Adds the time increment to the appropriate player's clock after a move.
 * @param {string} playerWhoMoved - The color of the player who just moved ('w' or 'b').
 */
function addIncrement(playerWhoMoved) {
    if (gameTime && gameTime.inc > 0) {
        if (playerWhoMoved === 'w') {
            whiteTime += gameTime.inc * 1000;
        } else {
            blackTime += gameTime.inc * 1000;
        }
    }
}