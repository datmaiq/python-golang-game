const board = document.getElementById("board");
const statusDisplay = document.getElementById("status");
const restartButton = document.getElementById("restart");
const pvpButton = document.getElementById("pvp");
const pvcButton = document.getElementById("pvc");
const selectXButton = document.getElementById("select-x");
const selectOButton = document.getElementById("select-o");
const modeSelection = document.getElementById("mode-selection");
const playerSelection = document.getElementById("player-selection");

let gameActive = true;
let currentPlayer = "X";
let playerSymbol = "X";
let aiSymbol = "O";
let gameState = Array(9).fill("");
let gameMode = "pvp";

const iconX = "assets/golang.png";
const iconO = "assets/python.png";

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.setAttribute("data-index", i);
  board.appendChild(cell);
}

const cells = Array.from(document.getElementsByClassName("cell"));

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
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    const icon = currentPlayer === "X" ? iconX : iconO;
    statusDisplay.innerHTML = `Player <img src="${icon}" alt="${currentPlayer}" /> wins!`;
    gameActive = false;
  }

  return roundWon;
};

const handleResultValidation = () => {
  if (checkWinner()) return;

  if (!gameState.includes("")) {
    statusDisplay.textContent = `Game ended in a draw!`;
    gameActive = false;
  } else {
    handlePlayerChange();
  }
};

const getBestMove = () => {
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === aiSymbol && gameState[b] === aiSymbol && !gameState[c])
      return c;
    if (gameState[a] === aiSymbol && !gameState[b] && gameState[c] === aiSymbol)
      return b;
    if (!gameState[a] && gameState[b] === aiSymbol && gameState[c] === aiSymbol)
      return a;
  }

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (
      gameState[a] === playerSymbol &&
      gameState[b] === playerSymbol &&
      !gameState[c]
    )
      return c;
    if (
      gameState[a] === playerSymbol &&
      !gameState[b] &&
      gameState[c] === playerSymbol
    )
      return b;
    if (
      !gameState[a] &&
      gameState[b] === playerSymbol &&
      gameState[c] === playerSymbol
    )
      return a;
  }

  const emptyCells = gameState
    .map((val, idx) => (val ? null : idx))
    .filter((val) => val !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const handleCellClick = (event) => {
  const clickedCell = event.target.closest(".cell");
  const clickedCellIndex = parseInt(clickedCell.dataset.index, 10);

  if (gameState[clickedCellIndex] || !gameActive) return;

  handleCellPlayed(clickedCell, clickedCellIndex);
  handleResultValidation();

  if (gameMode === "pvc" && gameActive) {
    currentPlayer = aiSymbol;
    const bestMove = getBestMove();
    const bestCell = cells[bestMove];
    handleCellPlayed(bestCell, bestMove);
    handleResultValidation();
  }
};

const handleRestartGame = () => {
  gameActive = true;
  currentPlayer = playerSymbol;
  gameState.fill("");
  const icon = currentPlayer === "X" ? iconX : iconO;
  statusDisplay.innerHTML = `It's <img src="${icon}" alt="${currentPlayer}" />'s turn`;
  cells.forEach((cell) => (cell.innerHTML = ""));
};

selectXButton.addEventListener("click", () => {
  playerSymbol = "X";
  aiSymbol = "O";
  playerSelection.style.display = "none";
  modeSelection.style.display = "block";

  handleRestartGame();
});

selectOButton.addEventListener("click", () => {
  playerSymbol = "O";
  aiSymbol = "X";
  playerSelection.style.display = "none";
  modeSelection.style.display = "block";

  handleRestartGame();
});

pvpButton.addEventListener("click", () => {
  gameMode = "pvp";
  handleRestartGame();
});

pvcButton.addEventListener("click", () => {
  gameMode = "pvc";
  handleRestartGame();
});

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
restartButton.addEventListener("click", handleRestartGame);
