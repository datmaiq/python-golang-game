class Game {
  constructor() {
    this.boardSize = 3;
    this.gameState = [];
    this.winningConditions = [];
    this.cells = [];
    this.gameActive = true;
    this.currentPlayer = "X";
    this.playerSymbol = null;
    this.gameMode = null;
    this.aiSymbol = null;

    this.iconX = "assets/golang.png";
    this.iconO = "assets/python.png";

    this.init();
  }

  init() {
    this.board = document.getElementById("board");
    this.statusDisplay = document.getElementById("status");
    this.restartButton = document.getElementById("restart");
    this.backButton = document.getElementById("back");
    this.pvpButton = document.getElementById("pvp");
    this.pvcButton = document.getElementById("pvc");
    this.selectXButton = document.getElementById("select-x");
    this.selectOButton = document.getElementById("select-o");
    this.modeSelection = document.getElementById("mode-selection");
    this.playerSelection = document.getElementById("player-selection");
    this.boardSizeInput = document.getElementById("board-size");
    this.startGameButton = document.getElementById("start-game");
    this.selectionScreen = document.getElementById("selection-screen");
    this.gameScreen = document.getElementById("game-screen");

    this.setupEventListeners();
    this.updateButtonIcons();
  }

  setupEventListeners() {
    this.selectXButton.addEventListener("click", () => this.selectSymbol("X"));
    this.selectOButton.addEventListener("click", () => this.selectSymbol("O"));
    this.pvpButton.addEventListener("click", () => this.selectMode("PvP"));
    this.pvcButton.addEventListener("click", () => this.selectMode("PvC"));
    this.startGameButton.addEventListener("click", () => this.startGame());
    this.restartButton.addEventListener("click", () => this.restartGame());
    this.backButton.addEventListener("click", () => this.goBack());
  }

  updateButtonIcons() {
    this.selectXButton.innerHTML = `<img src="${this.iconX}" alt="X" />`;
    this.selectOButton.innerHTML = `<img src="${this.iconO}" alt="O" />`;
  }

  selectSymbol(symbol) {
    this.playerSymbol = symbol;
    this.selectXButton.classList.toggle("selected", symbol === "X");
    this.selectOButton.classList.toggle("selected", symbol === "O");
    this.enableStartButton();
  }

  selectMode(mode) {
    this.gameMode = mode;
    this.aiSymbol =
      mode === "PvC" ? (this.playerSymbol === "X" ? "O" : "X") : null;
    this.pvpButton.classList.toggle("selected", mode === "PvP");
    this.pvcButton.classList.toggle("selected", mode === "PvC");
    this.enableStartButton();
  }

  enableStartButton() {
    this.startGameButton.disabled = !(this.playerSymbol && this.gameMode);
  }

  startGame() {
    if (this.playerSymbol && this.gameMode) {
      this.selectionScreen.style.display = "none";
      this.gameScreen.style.display = "block";
      this.restartGame();
    } else {
      alert("Please select both a symbol and a game mode.");
    }
  }

  goBack() {
    this.gameScreen.style.display = "none";
    this.selectionScreen.style.display = "block";
    this.resetSelection();
  }

  resetSelection() {
    this.selectXButton.classList.remove("selected");
    this.selectOButton.classList.remove("selected");
    this.pvpButton.classList.remove("selected");
    this.pvcButton.classList.remove("selected");
    this.playerSymbol = null;
    this.gameMode = null;
    this.aiSymbol = null;
    this.enableStartButton();
  }

  restartGame() {
    this.boardSize = parseInt(this.boardSizeInput.value, 10);
    this.gameState = Array(this.boardSize * this.boardSize).fill("");
    this.gameActive = true;
    this.currentPlayer = this.playerSymbol;
    this.winningConditions = this.generateWinningConditions(this.boardSize);
    this.createBoard();
    this.updateStatus();
    this.cells.forEach((cell) =>
      cell.addEventListener("click", (event) => this.handleCellClick(event))
    );

    if (this.gameMode === "PvC" && this.currentPlayer === this.aiSymbol) {
      this.makeAIMove();
    }
  }

  generateWinningConditions(size) {
    // Implement the logic to generate winning conditions
    let conditions = [];

    // Rows
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        row.push(i * size + j);
      }
      conditions.push(row);
    }

    // Columns
    for (let i = 0; i < size; i++) {
      let column = [];
      for (let j = 0; j < size; j++) {
        column.push(i + j * size);
      }
      conditions.push(column);
    }

    // Diagonals
    let diagonal1 = [];
    let diagonal2 = [];
    for (let i = 0; i < size; i++) {
      diagonal1.push(i * size + i);
      diagonal2.push((i + 1) * size - i - 1);
    }
    conditions.push(diagonal1);
    conditions.push(diagonal2);

    return conditions;
  }

  createBoard() {
    this.board.innerHTML = "";
    this.board.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;

    let cellSize = this.boardSize <= 5 ? "50px" : "30px";
    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.style.width = cellSize;
      cell.style.height = cellSize;
      cell.setAttribute("data-index", i);
      this.board.appendChild(cell);
    }
    this.cells = Array.from(document.getElementsByClassName("cell"));
  }

  updateStatus() {
    const icon = this.currentPlayer === "X" ? this.iconX : this.iconO;
    this.statusDisplay.innerHTML = `It's <img src="${icon}" alt="${this.currentPlayer}" />'s turn`;
  }

  handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute("data-index"), 10);

    if (this.gameState[index] !== "" || !this.gameActive) return;

    this.handleCellPlayed(cell, index);
    this.handleResultValidation();

    if (this.gameActive && this.currentPlayer === this.aiSymbol) {
      this.makeAIMove();
    }
  }

  handleCellPlayed(cell, index) {
    this.gameState[index] = this.currentPlayer;
    const icon = this.currentPlayer === "X" ? this.iconX : this.iconO;
    cell.innerHTML = `<img src="${icon}" alt="${this.currentPlayer}" />`;
  }

  handleResultValidation() {
    if (this.checkWinner()) return;

    if (!this.gameState.includes("")) {
      this.statusDisplay.textContent = "Game ended in a draw!";
      this.gameActive = false;
    } else {
      this.handlePlayerChange();
    }
  }

  checkWinner() {
    for (const condition of this.winningConditions) {
      const [a, b, c] = condition;
      if (
        this.gameState[a] &&
        this.gameState[a] === this.gameState[b] &&
        this.gameState[a] === this.gameState[c]
      ) {
        this.statusDisplay.innerHTML = `${this.gameState[a]} wins!`;
        this.gameActive = false;
        return true;
      }
    }
    return false;
  }

  handlePlayerChange() {
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    this.updateStatus();
  }

  makeAIMove() {
    const aiMove = this.getBestMove();
    if (aiMove !== undefined) {
      const aiCell = this.cells[aiMove];
      setTimeout(() => {
        this.handleCellPlayed(aiCell, aiMove);
        this.handleResultValidation();
      }, 300);
    }
  }

  getBestMove() {
    // Implement AI logic to determine the best move
    return this.gameState.indexOf("");
  }
}

// Instantiate the game
document.addEventListener("DOMContentLoaded", () => new Game());
