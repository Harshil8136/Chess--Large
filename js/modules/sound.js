// ===================================================================================
//  SOUND.JS
//  This module manages all audio aspects of the application, including loading
//  sounds and handling playback based on game events.
// ===================================================================================

// Initialize the global namespace and the sound module
window.ChessApp = window.ChessApp || {};
ChessApp.sound = (function() {
    'use strict';

    // --- Private State ---

    let sounds = {};
    let isMuted = false;

    // --- Public Methods ---

    /**
     * Initializes the sound module. It pre-loads all audio files defined in the
     * configuration using the Howler.js library.
     */
    function init() {
        console.log("Initializing Sound Module...");
        const soundPaths = ChessApp.config.SOUND_PATHS;
        for (const key in soundPaths) {
            if (Object.hasOwnProperty.call(soundPaths, key)) {
                sounds[key] = new Howl({
                    src: [soundPaths[key]]
                });
            }
        }
    }

    /**
     * Loads the user's mute preference from localStorage.
     * @returns {boolean} The user's mute status.
     */
    function loadSettings() {
        isMuted = localStorage.getItem('chessSoundMuted') === 'true';
        return isMuted;
    }

    /**
     * Plays a sound by its key name (e.g., 'capture', 'moveSelf').
     * @param {string} soundName - The key of the sound to play.
     */
    function play(soundName) {
        if (!isMuted && sounds[soundName]) {
            sounds[soundName].play();
        }
    }

    /**
     * Determines and plays the correct sound for a given chess move.
     * @param {object} move - The move object from chess.js.
     * @param {boolean} isCheck - Whether the move resulted in a check.
     */
    function playForMove(move, isCheck) {
        if (move.flags.includes('p')) {
            play('promote');
        } else if (move.flags.includes('k') || move.flags.includes('q')) {
            play('castle');
        } else if (move.flags.includes('c')) {
            play('capture');
        } else {
            play('moveSelf');
        }

        if (isCheck) {
            play('check');
        }
    }

    /**
     * Toggles the mute state on and off, saving the preference to localStorage.
     * @returns {boolean} The new mute status (true if muted, false otherwise).
     */
    function toggleMute() {
        isMuted = !isMuted;
        localStorage.setItem('chessSoundMuted', isMuted);
        console.log(`Sound muted: ${isMuted}`);
        return isMuted;
    }

    // Expose public methods
    return {
        init: init,
        loadSettings: loadSettings,
        play: play,
        playForMove: playForMove,
        toggleMute: toggleMute
    };

})();