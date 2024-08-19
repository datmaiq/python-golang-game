const board = document.getElementById("board");
const statusDisplay = document.getElementById("status");
const restartButton = document.getElementById("restart");
const backButton = document.getElementById("back");
const pvpButton = document.getElementById("pvp");
const pvcButton = document.getElementById("pvc");
const selectXButton = document.getElementById("select-x");
const selectOButton = document.getElementById("select-o");
const modeSelection = document.getElementById("mode-selection");
const playerSelection = document.getElementById("player-selection");
const boardSizeInput = document.getElementById("board-size");
const startGameButton = document.getElementById("start-game");
const selectionScreen = document.getElementById("selection-screen");
const gameScreen = document.getElementById("game-screen");

let boardSize = 3;
let gameState = [];
let winningConditions = [];
let cells = [];
let gameActive = true;
let currentPlayer = "X";
let playerSymbol = null;
let gameMode = null;
let aiSymbol = null;

const iconX = "assets/golang.png";
const iconO = "assets/python.png";

selectXButton.innerHTML = `<img src="${iconX}" alt="X" />`;
selectOButton.innerHTML = `<img src="${iconO}" alt="O" />`;

const validateBoardSize = () => {
  let boardSize = parseInt(boardSizeInput.value, 10);

  if (isNaN(boardSize) || boardSize < 3 || boardSize > 64) {
    alert("Please enter an integer number between 3 and 64.");
    boardSizeInput.value = 3; // Reset to default if invalid
    return 3;
  }

  return boardSize;
};

// Generate winning conditions based on the board size
const generateWinningConditions = (size) => {
  const conditions = [];
  const winLength = size >= 5 ? 5 : 3;

  // Rows
  for (let row = 0; row < size; row++) {
    for (let start = 0; start <= size - winLength; start++) {
      const rowCondition = [];
      for (let i = 0; i < winLength; i++) {
        rowCondition.push(row * size + start + i);
      }
      conditions.push(rowCondition);
    }
  }

  // Columns
  for (let col = 0; col < size; col++) {
    for (let start = 0; start <= size - winLength; start++) {
      const colCondition = [];
      for (let i = 0; i < winLength; i++) {
        colCondition.push((start + i) * size + col);
      }
      conditions.push(colCondition);
    }
  }

  for (let row = 0; row <= size - winLength; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const diagCondition = [];
      for (let i = 0; i < winLength; i++) {
        diagCondition.push((row + i) * size + (col + i));
      }
      conditions.push(diagCondition);
    }
  }

  for (let row = size - 1; row >= winLength - 1; row--) {
    for (let col = 0; col <= size - winLength; col++) {
      const diagCondition = [];
      for (let i = 0; i < winLength; i++) {
        diagCondition.push((row - i) * size + (col + i));
      }
      conditions.push(diagCondition);
    }
  }

  return conditions;
};

const createBoard = (size) => {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  let cellSize;
  if (size <= 5) {
    cellSize = "80px";
  } else {
    cellSize = "30px";
  }

  gameState = Array(size * size).fill(""); // Initialize the game state

  const createCellsChunk = (startIndex) => {
    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i < Math.min(startIndex + 50, size * size); i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.style.width = cellSize;
      cell.style.height = cellSize;
      cell.setAttribute("data-index", i);
      fragment.appendChild(cell);
    }
    board.appendChild(fragment);

    if (startIndex + 50 < size * size) {
      requestAnimationFrame(() => createCellsChunk(startIndex + 50));
    } else {
      cells = Array.from(document.getElementsByClassName("cell"));
      cells.forEach((cell) => {
        cell.addEventListener("click", handleCellClick);
      });
    }
  };

  requestAnimationFrame(() => createCellsChunk(0));
};

const handleCellPlayed = (cell, index) => {
  gameState[index] = currentPlayer;
  const icon = currentPlayer === "X" ? iconX : iconO;
  cell.innerHTML = `<img src="${icon}" alt="${currentPlayer}" />`;
};

const handlePlayerChange = () => {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  const icon = currentPlayer === "X" ? iconX : iconO;
  statusDisplay.innerHTML = `It's <img src="${icon}" alt="${currentPlayer}" />'s turn`;
};

const checkWinner = () => {
  let roundWon = false;
  let winningCells = [];
  for (let i = 0; i < winningConditions.length; i++) {
    const condition = winningConditions[i];
    if (
      condition.every(
        (index) =>
          gameState[index] && gameState[index] === gameState[condition[0]]
      )
    ) {
      roundWon = true;
      winningCells = condition;
      break;
    }
  }

  if (roundWon) {
    winningCells.forEach((index) => {
      cells[index].classList.add("winning");
    });

    const icon = currentPlayer === "X" ? iconX : iconO;
    statusDisplay.innerHTML = `Player <img src="${icon}" alt="${currentPlayer}" /> wins!`;
    gameActive = false;
  }

  return roundWon;
};

const handleResultValidation = () => {
  if (checkWinner()) {
    return;
  }

  if (!gameState.includes("")) {
    statusDisplay.textContent = `Game ended in a draw!`;
    gameActive = false;
  } else {
    handlePlayerChange();
  }
};

const getBestMove = () => {
  for (let i = 0; i < winningConditions.length; i++) {
    const condition = winningConditions[i];
    const [a, b, c, d, e] = condition;

    if (gameState[a] === aiSymbol && gameState[b] === aiSymbol && !gameState[c])
      return c;
    if (gameState[a] === aiSymbol && !gameState[b] && gameState[c] === aiSymbol)
      return b;
    if (!gameState[a] && gameState[b] === aiSymbol && gameState[c] === aiSymbol)
      return a;

    if (gameState[c] === aiSymbol && gameState[d] === aiSymbol && !gameState[e])
      return e;
    if (gameState[c] === aiSymbol && !gameState[d] && gameState[e] === aiSymbol)
      return d;
    if (!gameState[c] && gameState[d] === aiSymbol && gameState[e] === aiSymbol)
      return c;
  }

  const emptyCells = gameState
    .map((value, index) => (value === "" ? index : null))
    .filter((value) => value !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const handleCellClick = (event) => {
  const cell = event.target;
  const index = parseInt(cell.getAttribute("data-index"), 10);

  if (gameState[index] !== "" || !gameActive) return;

  handleCellPlayed(cell, index);
  handleResultValidation();

  if (!gameActive) return;

  if (currentPlayer === aiSymbol) {
    const aiMove = getBestMove();
    if (aiMove !== undefined) {
      const aiCell = cells[aiMove];
      setTimeout(() => {
        handleCellPlayed(aiCell, aiMove);
        handleResultValidation();
      }, 300);
    }
  }
};

const handleRestartGame = () => {
  boardSize = validateBoardSize();
  gameState = Array(boardSize * boardSize).fill("");
  gameActive = true;
  currentPlayer = playerSymbol;
  winningConditions = generateWinningConditions(boardSize);
  createBoard(boardSize);
  statusDisplay.innerHTML = `It's ${
    currentPlayer === "X"
      ? `<img src="${iconX}" alt="X" />`
      : `<img src="${iconO}" alt="O" />`
  }'s turn`;

  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
    cell.classList.remove("winning");
  });

  if (gameMode === "PvC" && currentPlayer === aiSymbol) {
    const aiMove = getBestMove();
    if (aiMove !== undefined) {
      const aiCell = cells[aiMove];
      setTimeout(() => {
        handleCellPlayed(aiCell, aiMove);
        handleResultValidation();
      }, 300);
    }
  }
};
const resetSelection = () => {
  selectXButton.classList.remove("selected");
  selectOButton.classList.remove("selected");
  pvpButton.classList.remove("selected");
  pvcButton.classList.remove("selected");
};

backButton.addEventListener("click", () => {
  gameScreen.style.display = "none";
  selectionScreen.style.display = "block";
  playerSymbol = null;
  gameMode = null;
  aiSymbol = null;
  resetSelection();
  enableStartButton();
});

const enableStartButton = () => {
  startGameButton.disabled = !(playerSymbol && gameMode);
};

selectXButton.addEventListener("click", () => {
  playerSymbol = "X";
  selectXButton.classList.add("selected");
  selectOButton.classList.remove("selected");
  enableStartButton();
});

selectOButton.addEventListener("click", () => {
  playerSymbol = "O";
  selectOButton.classList.add("selected");
  selectXButton.classList.remove("selected");
  enableStartButton();
});

pvpButton.addEventListener("click", () => {
  gameMode = "PvP";
  aiSymbol = null;
  pvpButton.classList.add("selected");
  pvcButton.classList.remove("selected");
  enableStartButton();
});

pvcButton.addEventListener("click", () => {
  gameMode = "PvC";
  aiSymbol = playerSymbol === "X" ? "O" : "X";
  pvcButton.classList.add("selected");
  pvpButton.classList.remove("selected");
  enableStartButton();
});

startGameButton.addEventListener("click", () => {
  if (playerSymbol && gameMode) {
    selectionScreen.style.display = "none";
    gameScreen.style.display = "block";
    handleRestartGame();
  } else {
    alert("Please select both a symbol and a game mode.");
  }
});

restartButton.addEventListener("click", handleRestartGame);
