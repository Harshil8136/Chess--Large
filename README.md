# HTML/CSS/JS Chess Application

## 📖 Overview

This is a complete, client-side chess application built with HTML, CSS, and JavaScript. It runs entirely in the browser without the need for a backend server. The application features a playable game against a configurable Stockfish AI, a detailed post-game analysis room, and a professional-grade logging and debugging system.

The entire project is designed to be self-contained and run directly from the local file system (`file:///` protocol), making it highly portable and easy to use.

---
## ✨ Features

* **Play vs. AI:** Play a full game of chess against the Stockfish engine with 12 configurable difficulty levels.
* **Full Chess Logic:** Flawlessly implements all standard chess rules, including castling, en passant, pawn promotion, and all draw conditions.
* **Intuitive Interface:** Supports both drag-and-drop and click-to-move, with clear highlighting for legal moves.
* **Live Feedback:** A real-time evaluation bar and move hints are available during gameplay.
* **Professional Game Review:** A dedicated "Analysis Room" provides a deep, post-game review with:
    * Accuracy scores for both players.
    * An estimated ELO performance for the game.
    * A move-by-move breakdown of classifications (Best, Blunder, Mistake, etc.).
    * Identification of "Key Moments" in the game.
* **Interactive Evaluation Graph:** A visual graph of the game's evaluation, with markers for critical moves and interactive hovering to highlight moves on the board.
* **Customization:** A settings panel allows for full customization of the UI, board, and piece themes. All preferences are saved locally.
* **Advanced Debugging:** A persistent, in-game console UI provides detailed, color-coded logs across multiple sessions to track application behavior without needing developer tools.

---
## 🚀 How to Run

This application is designed for simplicity and requires no setup or server.

1.  Ensure you have the complete project directory, including the `src/` and `assets/` folders.
2.  Open the **`index.html`** file directly in a modern web browser (like Google Chrome, Mozilla Firefox, or Microsoft Edge).

That's it. The game will load and be ready to play. An internet connection is only needed for the initial download of the Stockfish engine from its online CDN.

---
## 📁 Project Structure
(root directory)
├── index.html
├── README.md
│
├── src/
│   ├── style.css
│   ├── js/
│   └── analysis/
│
└── assets/
├── icon/
├── img/
├── lib/
└── sounds/
