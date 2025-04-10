// Configuração do Socket.io (substitua pela sua URL do Render)
const socket = io('https://truco-backend.onrender.com');
let roomId = '';
let playerId = 'player_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
let playerNumber = 0;

// Elementos da interface
const lobby = document.getElementById('lobby');
const gameContainer = document.getElementById('game-container');
const createRoomBtn = document.getElementById('createRoom');
const joinRoomBtn = document.getElementById('joinRoom');
const roomInput = document.getElementById('roomId');
const errorMsg = document.getElementById('error-msg');
const roomCode = document.getElementById('room-code');
const playersCount = document.getElementById('players-count');
const playersList = document.getElementById('players-list');

// Cria sala
createRoomBtn.addEventListener('click', () => {
    roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    socket.emit('create-room', { roomId, playerId });
    
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('room-info').style.display = 'block';
    roomCode.textContent = roomId;
});

// Entra em sala
joinRoomBtn.addEventListener('click', () => {
    const code = roomInput.value.trim().toUpperCase();
    if (code.length !== 4) {
        errorMsg.textContent = 'O código deve ter 4 caracteres!';
        return;
    }
    socket.emit('join-room', { roomId: code, playerId });
});

// Ouvintes do Socket.io
socket.on('room-created', (data) => {
    console.log('Sala criada:', data.roomId);
});

socket.on('player-joined', (data) => {
    playersCount.textContent = `${data.players.length}/4`;
    playersList.innerHTML = data.players.map(p => 
        `<div>${p === playerId ? 'Você' : 'Jogador'}</div>`
    ).join('');
});

socket.on('game-started', () => {
    lobby.style.display = 'none';
    gameContainer.style.display = 'block';
    // Inicia a lógica do jogo aqui
});

socket.on('error', (msg) => {
    errorMsg.textContent = msg;
});
