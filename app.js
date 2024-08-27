const socket = io();

let currentPlayer = 'A'; // Assume Player A starts first
let selectedCharacter = null;

// Generate the game board
const board = document.getElementById('game-board');
const boardSize = 5;

// Initialize board with chessmen
let gameState = {
    board: [
        [{ player: 'A', character: 'P1' }, { player: 'A', character: 'H1' }, { player: 'A', character: 'H2' }, { player: 'A', character: 'H3' }, { player: 'A', character: 'P2' }],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [{ player: 'B', character: 'P1' }, { player: 'B', character: 'H1' }, { player: 'B', character: 'H2' }, { player: 'B', character: 'H3' }, { player: 'B', character: 'P2' }],
    ],
    currentPlayer: 'A',
};

// Render the board
function renderBoard() {
    board.innerHTML = '';
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('button');
            cell.classList.add('cell');
            cell.id = `cell-${i}-${j}`;
            const piece = gameState.board[i][j];
            if (piece) {
                cell.textContent = `${piece.player}-${piece.character}`;
                cell.classList.add(piece.player === 'A' ? 'playerA' : 'playerB');
            }
            cell.addEventListener('click', () => handleCellClick(i, j));
            board.appendChild(cell);
        }
    }
}

// Handle cell click
function handleCellClick(row, col) {
    if (selectedCharacter) {
        const move = { character: selectedCharacter, row, col };
        socket.emit('playerMove', move);
        selectedCharacter = null;
    } else {
        const piece = gameState.board[row][col];
        if (piece && piece.player === currentPlayer) {
            selectedCharacter = piece.character;
            // Highlight possible moves here if needed
        }
    }
}

// Listen for server events
socket.on('gameStateUpdate', (newGameState) => {
    gameState = newGameState;
    renderBoard();
    updateTurn(gameState.currentPlayer);
});

socket.on('invalidMove', (message) => {
    alert(message);
});

socket.on('gameOver', (winner) => {
    alert(`${winner} wins the game!`);
});

function updateTurn(player) {
    currentPlayer = player;
    document.getElementById('player-turn').textContent = `Current Turn: Player ${player}`;
}

// Initial render
renderBoard();
updateTurn(gameState.currentPlayer);
