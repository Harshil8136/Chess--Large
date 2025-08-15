## Application Overview chessboard
This is a modern, browser-based chess application designed to provide a comprehensive playing and analysis experience. It's built entirely with client-side web technologies (HTML, CSS, and JavaScript), meaning it runs directly in a web browser without needing a dedicated server. Its modular architecture ensures stability and maintainability.

## Core Features
The application is divided into three main feature sets: gameplay, user experience, and post-game analysis.
Gameplay & AI
Complete Chess Logic: Flawlessly implements all rules of chess, including special moves like castling, en passant, and pawn promotion.
Scalable AI Opponent: Integrated with the powerful Stockfish chess engine, allowing users to play against a competent AI.
Adjustable Difficulty: Features multiple ELO-based difficulty levels, from beginner to advanced, by adjusting the engine's calculation depth and time.
Time Controls: Supports various timing formats, including unlimited time, blitz, and rapid games with time increments.

User Interface & Experience
Dual-Input Board: Offers both intuitive drag-and-drop and click-to-move functionality for piece interaction.
Visual Feedback: Provides clear highlighting for selected pieces, all legal moves, and potential threats to the player's pieces.
Live Evaluation Bar: A real-time evaluation bar shows the strategic advantage according to the engine.
Full Customization: Users can personalize their experience by choosing from multiple board themes, piece styles, and overall UI color themes.
Premove Functionality: Players can queue their next move while the AI is thinking, allowing for faster gameplay.
Game Analysis & Review
Full Game Review: After a game, users can run a comprehensive analysis that evaluates every move.
Move Classification: Each move is categorized (e.g., Brilliant, Best, Mistake, Blunder) based on its impact on the game.
Accuracy Score: Provides a percentage-based accuracy score for both players, summarizing their overall performance.
Interactive Replay: Users can navigate through the game's move history, with the board updating to any position. The engine's "best line" is shown for key moments.
Evaluation Graph: A visual chart plots the engine's evaluation after each move, making it easy to see the game's turning points.

## Technical Architecture & Libraries
The application is built using a curated set of powerful, open-source libraries to handle the complex aspects of chess logic, engine communication, and user interaction.

How It's Built
The structure is a classic single-page application. HTML provides the skeleton, CSS (a mix of Tailwind CSS and a custom stylesheet) handles the responsive design and theming, and JavaScript drives all functionality.
A key architectural decision is the use of a Web Worker to run the Stockfish engine. This moves the intensive AI calculations to a background thread, ensuring the user interface remains smooth and responsive at all times. The application intelligently manages multiple engine instances: one for the AI opponent and a separate, lower-priority one for live analysis and hints to prevent conflicts.

Third-Party Libraries
chess.js: The logical "rules engine" of the application. This library is responsible for move validation, FEN/PGN parsing, and tracking all game states (like checkmate or stalemate).
chessboard.js: This library renders the interactive visual chessboard, handling piece placement and user input.
jQuery: Used to simplify DOM manipulation and event handling across the application.
howler.js: A robust audio library that manages all game sound effects for a consistent cross-browser experience.
Chart.js: Powers the dynamic and interactive evaluation graph in the Analysis Room.
SweetAlert2: Used to create clean, professional-looking pop-up dialogs for things like pawn promotion and game-over notifications.
GSAP (GreenSock): A high-performance animation library that ensures smooth visuals, most notably for the real-time evaluation bar.

Here is a breakdown of what each file does in the project.

## Root Directory 📁
index.html: This is the main file for the entire application. It defines the complete HTML structure—the board, the sidebar, all the buttons, and modal dialogs. It's also responsible for loading all the necessary CSS stylesheets and JavaScript files in the correct order.

style.css: This file contains all the custom styling rules. It controls the application's visual appearance, including the color themes, board and piece styles, fonts, and the layout of all components.

## JavaScript Files (js/) 📜
The application's logic is split into several JavaScript files, each with a specific responsibility. They are loaded in order of dependency.

js/config.js: A centralized configuration file. It holds all the application's static data, such as the definitions for UI themes, board colors, piece sets, AI difficulty levels, and the list of known chess openings. This separation makes it easy to update settings without altering the core game logic.

js/ui-elements.js: This file's primary role is to get and store references to all the interactive HTML elements (like buttons, status displays, and selectors). By defining them in one place, it provides a clean and efficient way for all other scripts to access and manipulate these elements.

js/ui-feedback.js: This file is dedicated to functions that update the UI to provide feedback to the user. This includes updating the move history log, the captured pieces display, the game clocks, the evaluation bar, and the game status text (e.g., "White's Turn").

js/ui-interactions.js: This file handles interactive UI components and events. It contains the logic for initializing the sound system, showing pop-up modals (like the pawn promotion choice), managing the draggable debug console, and handling tab switching in the sidebar.

js/board.js: This file controls everything related to the visual chessboard. It initializes the chessboard.js library and manages all direct user interactions with the board, such as clicking squares, dragging and dropping pieces, and drawing arrows or highlights.

js/game.js: This is the core gameplay engine. It uses the chess.js library to manage the logical state of the game, enforce the rules of chess, execute moves for both the player and the AI, and manage the game clock.

js/main.js: This is the main entry point for the application. It kicks everything off when the page loads. It's responsible for initializing all the other modules, setting up the primary event listeners (like keyboard shortcuts), and loading the Stockfish chess engine.

## Analysis Files (analysis/) 📊
This directory contains the code for the post-game review feature.
analysis/analysis-core.js: The "brain" of the analysis feature. It takes a completed game and uses the Stockfish engine to evaluate each move, calculating its quality and assigning a classification (e.g., Blunder, Best Move).

analysis/analysis-ui.js: The "face" of the analysis feature. It takes the data processed by analysis-core.js and renders the entire analysis interface, including the interactive move list, the evaluation graph, and the move assessment details.

## Asset Folders (img/, icon/, sounds/) 🖼️🎵
These directories simply store the application's media assets.
img/: Contains the image files for all the different chess piece sets.
icon/: Holds all the UI icons used for buttons and controls.
sounds/: Contains the .mp3 files for all game sound effects.
