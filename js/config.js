// ===================================================================================
//  CONFIG.JS
//  Central configuration and settings for the chess application.
//  All settings are now part of the global ChessApp.config namespace.
// ===================================================================================

// Initialize the global namespace if it doesn't exist
window.ChessApp = window.ChessApp || {};

ChessApp.config = {
    UI_THEMES: [
        {
            name: 'charcoal',
            displayName: 'Charcoal 숯',
            colors: {
                '--bg-main': '#262522',
                '--bg-panel': '#312e2b',
                '--text-light': '#f5f5f4',
                '--text-dark': '#a8a29e',
                '--border': '#57534e',
                '--btn-primary-bg': '#2563eb',
                '--btn-primary-hover': '#1d4ed8',
                '--btn-secondary-bg': '#57534e',
                '--btn-secondary-hover': '#44403c',
            }
        },
        {
            name: 'midnight',
            displayName: 'Midnight 🌃',
            colors: {
                '--bg-main': '#1e293b',
                '--bg-panel': '#334155',
                '--text-light': '#f1f5f9',
                '--text-dark': '#94a3b8',
                '--border': '#475569',
                '--btn-primary-bg': '#be123c',
                '--btn-primary-hover': '#9f1239',
                '--btn-secondary-bg': '#475569',
                '--btn-secondary-hover': '#334155',
            }
        },
        {
            name: 'forest',
            displayName: 'Forest 🌲',
            colors: {
                '--bg-main': '#1a2e24',
                '--bg-panel': '#224030',
                '--text-light': '#e8f5e9',
                '--text-dark': '#a5d6a7',
                '--border': '#388e3c',
                '--btn-primary-bg': '#f59e0b',
                '--btn-primary-hover': '#d97706',
                '--btn-secondary-bg': '#388e3c',
                '--btn-secondary-hover': '#2e7d32',
            }
        },
        {
            name: 'ocean',
            displayName: 'Ocean 🌊',
            colors: {
                '--bg-main': '#0a2342',
                '--bg-panel': '#1d4263',
                '--text-light': '#e9f1f8',
                '--text-dark': '#86a8c4',
                '--border': '#2f5b82',
                '--btn-primary-bg': '#ffbf00',
                '--btn-primary-hover': '#e6a800',
                '--btn-secondary-bg': '#2f5b82',
                '--btn-secondary-hover': '#254e70',
            }
        },
        {
            name: 'sunset',
            displayName: 'Sunset 🌇',
            colors: {
                '--bg-main': '#2d182e',
                '--bg-panel': '#48244e',
                '--text-light': '#f2e8f1',
                '--text-dark': '#c8a8c4',
                '--border': '#704276',
                '--btn-primary-bg': '#e66b4d',
                '--btn-primary-hover': '#cc5c42',
                '--btn-secondary-bg': '#704276',
                '--btn-secondary-hover': '#5e3a64',
            }
        },
        {
            name: 'retro',
            displayName: 'Retro 💾',
            colors: {
                '--bg-main': '#212121',
                '--bg-panel': '#363636',
                '--text-light': '#f0f0f0',
                '--text-dark': '#b0b0b0',
                '--border': '#555555',
                '--btn-primary-bg': '#00ff00',
                '--btn-primary-hover': '#00cc00',
                '--btn-secondary-bg': '#555555',
                '--btn-secondary-hover': '#404040',
            }
        },
        {
            name: 'high-contrast',
            displayName: 'High Contrast 🌗',
            colors: {
                '--bg-main': '#000000',
                '--bg-panel': '#333333',
                '--text-light': '#ffffff',
                '--text-dark': '#cccccc',
                '--border': '#666666',
                '--btn-primary-bg': '#ff0000',
                '--btn-primary-hover': '#cc0000',
                '--btn-secondary-bg': '#333333',
                '--btn-secondary-hover': '#555555',
            }
        },
        {
            name: 'lavender',
            displayName: 'Lavender 💜',
            colors: {
                '--bg-main': '#e6e6fa',
                '--bg-panel': '#d8bfd8',
                '--text-light': '#363062',
                '--text-dark': '#6a5acd',
                '--border': '#b099d4',
                '--btn-primary-bg': '#8a2be2',
                '--btn-primary-hover': '#7a1be1',
                '--btn-secondary-bg': '#b099d4',
                '--btn-secondary-hover': '#a188c9',
            }
        },
        {
            name: 'mint',
            displayName: 'Mint 🌱',
            colors: {
                '--bg-main': '#f0fff0',
                '--bg-panel': '#c4d8c4',
                '--text-light': '#2f4f4f',
                '--text-dark': '#556b2f',
                '--border': '#8fbc8f',
                '--btn-primary-bg': '#3cb371',
                '--btn-primary-hover': '#32a162',
                '--btn-secondary-bg': '#8fbc8f',
                '--btn-secondary-hover': '#7a9e7a',
            }
        }
    ],

    APP_CONFIG: {
        STOCKFISH_URL: 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js',
        DEFAULT_BOARD_THEME: 'green',
        DEFAULT_PIECE_THEME: 'alpha',
        MATE_SCORE: 10000
    },

    THEMES: [
        { name: 'green', displayName: 'Green 🟩', colors: { light: '#eaefd2', dark: '#769656' } },
        { name: 'brown', displayName: 'Brown 🟫', colors: { light: '#f0d9b5', dark: '#b58863' } },
        { name: 'blue',  displayName: 'Blue 🟦',  colors: { light: '#dee3e6', dark: '#8ca2ad' } },
        { name: 'stone', displayName: 'Stone 🗿', colors: { light: '#d1d1d1', dark: '#a7a7a7' } }
    ],

    // UPDATED: All piece theme paths now point to the assets/img/ directory
    PIECE_THEMES: {
        alpha: 'assets/img/alpha/{piece}.png', anarcandy: 'assets/img/anarcandy/{piece}.png', caliente: 'assets/img/caliente/{piece}.png',
        california: 'assets/img/california/{piece}.png', cardinal: 'assets/img/cardinal/{piece}.png', cburnett: 'assets/img/cburnett/{piece}.png',
        celtic: 'assets/img/celtic/{piece}.png', chess7: 'assets/img/chess7/{piece}.png', chessnut: 'assets/img/chessnut/{piece}.png',
        companion: 'assets/img/companion/{piece}.png', cooke: 'assets/img/cooke/{piece}.png', dubrovny: 'assets/img/dubrovny/{piece}.png',
        fantasy: 'assets/img/fantasy/{piece}.png', firi: 'assets/img/firi/{piece}.png', fresca: 'assets/img/fresca/{piece}.png',
        gioco: 'assets/img/gioco/{piece}.png', governor: 'assets/img/governor/{piece}.png', horsey: 'assets/img/horsey/{piece}.png',
        icpieces: 'assets/img/icpieces/{piece}.png', kosal: 'assets/img/kosal/{piece}.png', leipzig: 'assets/img/leipzig/{piece}.png',
        letter: 'assets/img/letter/{piece}.png', maestro: 'assets/img/maestro/{piece}.png', merida: 'assets/img/merida/{piece}.png',
        monarchy: 'assets/img/monarchy/{piece}.png', mpchess: 'assets/img/mpchess/{piece}.png', pirouetti: 'assets/img/pirouetti/{piece}.png',
        pixel: 'assets/img/pixel/{piece}.png', reillycraig: 'assets/img/reillycraig/{piece}.png', rhosgfx: 'assets/img/rhosgfx/{piece}.png',
        riohacha: 'assets/img/riohacha/{piece}.png', shapes: 'assets/img/shapes/{piece}.png', spatial: 'assets/img/spatial/{piece}.png',
        staunty: 'assets/img/staunty/{piece}.png', tatiana: 'assets/img/tatiana/{piece}.png', wikipedia: 'assets/img/wikipedia/{piece}.png',
        xkcd: 'assets/img/xkcd/{piece}.png'
    },

    DIFFICULTY_SETTINGS: {
        1: { elo: 450,  type: 'random' },
        2: { elo: 650,  type: 'greedy' },
        3: { elo: 850,  type: 'stockfish', depth: 2 },
        4: { elo: 1000, type: 'stockfish', depth: 4 },
        5: { elo: 1200, type: 'stockfish', depth: 6 },
        6: { elo: 1400, type: 'stockfish', depth: 8 },
        7: { elo: 1600, type: 'stockfish', movetime: 500 },
        8: { elo: 1800, type: 'stockfish', movetime: 800 },
        9: { elo: 2000, type: 'stockfish', movetime: 1200 },
        10: { elo: 2200, type: 'stockfish', movetime: 1600 },
        11: { elo: 2400, type: 'stockfish', movetime: 2000 },
        12: { elo: 2700, type: 'stockfish', movetime: 2500 }
    },

    MATERIAL_POINTS: { p: 1, n: 3, b: 3, r: 5, q: 9 },

    // UPDATED: All sound paths now point to the assets/sounds/ directory
    SOUND_PATHS: {
        'moveSelf': 'assets/sounds/move-self.mp3',
        'capture': 'assets/sounds/capture.mp3',
        'check': 'assets/sounds/move-check.mp3',
        'gameEnd': 'assets/sounds/game-end.mp3',
        'gameStart': 'assets/sounds/game-start.mp3',
        'castle': 'assets/sounds/castle.mp3',
        'promote': 'assets/sounds/promote.mp3',
        'notify': 'assets/sounds/notify.mp3'
    },

    // NEW: Centralized paths for icons used in JS
    ICON_PATHS: {
        soundOn: 'assets/icons/speaker-wave.png',
        soundOff: 'assets/icons/speaker-x-mark.png'
    },

    OPENINGS: [
        { pgn: "1. e4", name: "King's Pawn Opening" },
        { pgn: "1. d4", name: "Queen's Pawn Opening" },
        { pgn: "1. c4", name: "English Opening" },
        { pgn: "1. Nf3", name: "Réti Opening" },
        { pgn: "1. f4", name: "Bird's Opening" },
        { pgn: "1. b3", name: "Larsen's Opening" },
        { pgn: "1. g3", name: "King's Fianchetto Opening" },
        { pgn: "1. e4 e5", name: "King's Pawn Game" },
        { pgn: "1. e4 e5 2. Nf3", name: "King's Knight Opening" },
        { pgn: "1. e4 e5 2. Nf3 Nc6", name: "Open Game" },
        { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", name: "Ruy López" },
        { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", name: "Italian Game" },
        { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5", name: "Giuoco Piano" },
        { pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6", name: "Two Knights Defense" },
        { pgn: "1. e4 e5 2. Nf3 Nc6 3. d4", name: "Scotch Game" },
        { pgn: "1. e4 e5 2. Nf3 d6", name: "Philidor Defense" },
        { pgn: "1. e4 e5 2. Nf3 Nf6", name: "Petrov's Defense" },
        { pgn: "1. e4 e5 2. f4", name: "King's Gambit" },
        { pgn: "1. e4 c5", name: "Sicilian Defense" },
        { pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", name: "Sicilian Defense: Najdorf Variation" },
        { pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6", name: "Sicilian Defense: Dragon Variation" },
        { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e6", name: "Sicilian Defense: Scheveningen Variation" },
        { pgn: "1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5", name: "Sicilian Defense: Sveshnikov Variation" },
        { pgn: "1. e4 c6", name: "Caro-Kann Defense" },
        { pgn: "1. e4 e6", name: "French Defense" },
        { pgn: "1. e4 d5", name: "Scandinavian Defense" },
        { pgn: "1. e4 Nf6", name: "Alekhine's Defense" },
        { pgn: "1. e4 d6", name: "Pirc Defense" },
        { pgn: "1. e4 g6", name: "Modern Defense" },
        { pgn: "1. d4 d5", name: "Queen's Pawn Game" },
        { pgn: "1. d4 d5 2. c4", name: "Queen's Gambit" },
        { pgn: "1. d4 d5 2. c4 e6", name: "Queen's Gambit Declined (QGD)" },
        { pgn: "1. d4 d5 2. c4 dxc4", name: "Queen's Gambit Accepted (QGA)" },
        { pgn: "1. d4 d5 2. c4 c6", name: "Slav Defense" },
        { pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4", name: "Slav Defense: Accepted" },
        { pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5", name: "QGD: Exchange Variation" },
        { pgn: "1. d4 Nf6", name: "Indian Defense" },
        { pgn: "1. d4 Nf6 2. c4", name: "Indian Game" },
        { pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4", name: "Nimzo-Indian Defense" },
        { pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6", name: "Queen's Indian Defense" },
        { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7", name: "King's Indian Defense (KID)" },
        { pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5", name: "Grünfeld Defense" },
        { pgn: "1. d4 f5", name: "Dutch Defense" },
        { pgn: "1. d4 e5", name: "Englund Gambit" },
        { pgn: "1. c4 e5", name: "English Opening: King's English Variation" },
        { pgn: "1. c4 Nf6", name: "English Opening: Anglo-Indian Defense" },
        { pgn: "1. Nf3 d5", name: "Réti Opening: Main Line" }
    ]
};