// ===================================================================================
//  SOUND.JS
//  Manages all sound playback for the application.
// ===================================================================================

let sounds = {};
let isMuted = false;

/**
 * Initializes all sound objects using Howler.js from the paths in SOUND_PATHS.
 */
function initSounds() {
    Object.keys(SOUND_PATHS).forEach(key => {
        sounds[key] = new Howl({ src: [SOUND_PATHS[key]] });
    });
}

/**
 * Plays a sound from the initialized pool if sound is not muted.
 * @param {string} soundName - The name of the sound to play.
 */
function playSound(soundName) {
    if (isMuted) return;
    if (sounds[soundName]) {
        sounds[soundName].play();
    }
}

/**
 * Plays the appropriate sound based on the result of a move.
 * @param {object} move - The move object returned from chess.js.
 * @param {boolean} isOpponentMove - True if the move was made by the AI.
 */
function playMoveSound(move, isOpponentMove = false) {
    if (isMuted) return;

    if (move.flags.includes('p')) {
        playSound('promote');
    } else if (move.flags.includes('k') || move.flags.includes('q')) {
        playSound('castle');
    } else if (move.flags.includes('c')) {
        playSound('capture');
    } else {
        playSound(isOpponentMove ? 'moveOpponent' : 'moveSelf');
    }

    // FIXED: Delay the check sound slightly to prevent audio pool errors.
    if (game.in_check()) {
        setTimeout(() => {
            playSound('check');
        }, 150);
    }
}

/**
 * Toggles the sound on or off and updates the UI icon.
 */
function toggleSound() {
    isMuted = !isMuted;
    localStorage.setItem('chessSoundMuted', isMuted);
    soundIcon.attr('src', isMuted ? 'icon/speaker-x-mark.png' : 'icon/speaker-wave.png');
    console.log({ logType: 'info', text: `Sound toggled: ${!isMuted}` });
}