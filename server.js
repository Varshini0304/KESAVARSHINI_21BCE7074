const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.emit('gameStateUpdate', gameState);

    socket.on('playerMove', (move) => {
        if (isValidMove(move)) {
            updateGameState(move);
            io.emit('gameStateUpdate', gameState);

            if (isGameOver()) {
                io.emit('gameOver', gameState.currentPlayer);
                resetGame();
            } else {
                switchTurn();
            }
        } else {
            socket.emit('invalidMove', 'Invalid move. Try again.');
        }
    });
});

function isValidMove(move) {
    // Add your move validation logic here
    return true;
}

function updateGameState(move) {
    const { row, col, character } = move;
    const currentPlayer = gameState.currentPlayer;

    // Remove the character from its previous position
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (gameState.board[i][j] && gameState.board[i][j].character === character && gameState.board[i][j].player === currentPlayer) {
                gameState.board[i][j] = null;
            }
        }
    }

    // Place the character in the new position and handle combat
    const targetCell = gameState.board[row][col];
    if (targetCell && targetCell.player !== currentPlayer) {
        gameState.board[row][col] = { player: currentPlayer, character };
    } else {
        gameState.board[row][col] = { player: currentPlayer, character };
    }
}

function switchTurn() {
    gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
}

function isGameOver() {
    const allCharacters = gameState.board.flat().filter(piece => piece !== null);
    const playerACharacters = allCharacters.filter(piece => piece.player === 'A');
    const playerBCharacters = allCharacters.filter(piece => piece.player === 'B');
    return playerACharacters.length === 0 || playerBCharacters.length === 0;
}

function resetGame() {
    gameState = {
        board: [
            [{ player: 'A', character: 'P1' }, { player: 'A', character: 'H1' }, { player: 'A', character: 'H2' }, { player: 'A', character: 'H3' }, { player: 'A', character: 'P2' }],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [{ player: 'B', character: 'P1' }, { player: 'B', character: 'H1' }, { player: 'B', character: 'H2' }, { player: 'B', character: 'H3' }, { player: 'B', character: 'P2' }],
        ],
        currentPlayer: 'A',
    };
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
