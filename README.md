**Browser-Based Chess with Deep Analysis ♟️**
A feature-rich, single-page chess application built with modern web technologies. Play against a powerful AI, analyze your games with move-by-move feedback, and enjoy a fully customizable interface—all running directly in your browser with no server required.

This project is designed to be a completely self-contained and portable chess experience that functions perfectly when opened directly from the local filesystem (file:///), without the need for a web server.

## Core Features
**👑 Gameplay & AI**
Full FIDE Rule Implementation: Powered by chess.js for flawless rule enforcement, including special moves like castling, en passant, and pawn promotion.
Scalable Stockfish AI: Play against the world-class Stockfish chess engine, running safely in a background Web Worker to keep the UI fast and responsive.
Adjustable Difficulty: A range of ELO-based difficulty levels, from beginner to grandmaster, perfect for all skill levels.
Time Controls: Supports multiple time formats, including Unlimited, Blitz (3+2), and Rapid (15+10), with automatic time increment handling.

**🎨 UI & User Experience**
Interactive Board: Intuitive piece movement with both drag-and-drop and click-to-move controls.
Instant Visual Feedback: Clear highlighting for selected pieces, legal moves, premoves, and threatened pieces.
Live Evaluation Bar: A real-time evaluation bar provides an at-a-glance understanding of the strategic advantage.
Full Customization: Personalize your experience with a wide array of board themes, piece sets, and UI color themes, with all preferences saved locally.

**📊 Game Analysis & Review**
Deep Post-Game Analysis: A powerful analysis engine evaluates every move of your game, providing classifications and insights.
Rich Move Classification: Moves are categorized with descriptive icons and colors (Brilliant, Great, Best, Mistake, Blunder, etc.).
Player Accuracy Score: Get a percentage-based accuracy score for both players to summarize overall performance.
Interactive Evaluation Graph: A dynamic chart visualizes the flow of the game. Click anywhere on the graph to instantly jump to that move.

**⚙️ Advanced Tools**
FEN & PGN Support: Load any position using a FEN string or export your completed games as a PGN file.
Advanced In-Game Debugger: A custom-built console log provides detailed application information, including a "Verbose Mode" to view raw engine communication, performance timers, and a global error handler—all designed to work in environments where browser developer tools are disabled.

## Tech Stack & Architecture
The application is a classic single-page application built with a modular file structure. A key architectural decision is the use of Web Workers to run the Stockfish engine in a separate thread, ensuring the UI never freezes during complex AI calculations. The app intelligently manages multiple engine instances for the AI opponent, live analysis, and hints to prevent resource conflicts.

**Library	Purpose**
Stockfish	The powerful open-source chess engine, running in a Web Worker.
chess.js	For all game logic, move validation, and FIDE rule enforcement.
chessboard.js	Renders the visual, interactive chessboard and handles user input.
jQuery	Simplifies DOM manipulation and event handling across the application.
Chart.js	Creates the interactive evaluation graph for the post-game analysis.
Howler.js	Manages all game sound effects for a reliable, cross-browser experience.
SweetAlert2	Provides clean, professional-looking pop-up modals and dialogs.
GSAP	A high-performance animation library for smooth UI effects like the evaluation bar.
Tailwind CSS	A utility-first CSS framework for building the application's layout and interface.

**Browser-Based Chess with Deep Analysis ♟️**
A feature-rich, single-page chess application built with modern web technologies. Play against a powerful AI, analyze your games with move-by-move feedback, and enjoy a fully customizable interface—all running directly in your browser with no server required.
This project is designed to be a completely self-contained and portable chess experience that functions perfectly when opened directly from the local filesystem (file:///), without the need for a web server.

Export to Sheets
## How to Run
This application is designed to run without a server.
Download or clone the entire project repository.
Ensure all folders (js, css, icon, img, lib, sounds, etc.) are in the same root directory.
Open the index.html file directly in a modern web browser (like Chrome, Firefox, or Edge).

## File Structure
The code is organized into a clear and modular structure:

**/ (root)**
index.html: The main HTML skeleton for the application.
style.css: The primary stylesheet for custom themes and component styling.

**/js/**
config-data.js & config.js: Centralize all static data and settings.
debugger.js: The custom error handling and logging service.
engine.js: Manages the creation and configuration of Stockfish instances.
analysis-helpers.js: Contains shared, centralized logic for move classification.
ui-*.js files: A set of files that handle UI elements, feedback, and interactions.
board.js, game.js, main.js: Control board interactions, core game logic, and application startup.

**/analysis/**
analysis-core.js: The "brain" of the post-game analysis feature.
analysis-ui.js: The "face" of the analysis room, handling all rendering.
**/lib/**: Contains all third-party libraries.
**/icon/**, /img/, /sounds/: Contain all static assets.
