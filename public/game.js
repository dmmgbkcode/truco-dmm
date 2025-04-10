// Conexão com seu backend no Render
const socket = io('https://truco-dmm.onrender.com');
let roomId = '';
let playerId = 'player_' + Math.random().toString(36).substring(2, 9);
let playerNumber = 0;
let currentPlayers = [];

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
const playerHand = document.getElementById('player-hand');

// Cria uma nova sala
createRoomBtn.addEventListener('click', () => {
    roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    socket.emit('create-room', { 
        roomId: roomId, 
        playerId: playerId 
    });
    
    document.getElementById('create-section').style.display = 'none';
    document.getElementById('join-section').style.display = 'none';
    document.getElementById('room-info').style.display = 'block';
    roomCode.textContent = roomId;
});

// Entra em uma sala existente
joinRoomBtn.addEventListener('click', () => {
    const enteredRoomId = roomInput.value.trim().toUpperCase();
    if (enteredRoomId.length !== 4) {
        errorMsg.textContent = 'O código deve ter 4 caracteres!';
        return;
    }
    
    socket.emit('join-room', { 
        roomId: enteredRoomId, 
        playerId: playerId 
    });
});

// Ouvintes de eventos do servidor
socket.on('room-created', (data) => {
    console.log('Sala criada:', data.roomId);
    roomId = data.roomId;
});

socket.on('player-joined', (data) => {
    currentPlayers = data.players;
    playersCount.textContent = `${currentPlayers.length}/4`;
    
    // Atualiza lista de jogadores
    playersList.innerHTML = '';
    currentPlayers.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.textContent = `Jogador ${index + 1}: ${player === playerId ? 'Você' : 'Conectado'}`;
        playersList.appendChild(playerElement);
    });
    
    // Mostra opção para outros jogadores entrarem
    if (currentPlayers.length === 1) {
        document.getElementById('join-section').style.display = 'block';
    }
});

socket.on('game-started', (data) => {
    lobby.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // Distribui cartas para o jogador atual
    if (data.hands && data.hands[playerNumber]) {
        renderPlayerHand(data.hands[playerNumber]);
    }
});

socket.on('error', (message) => {
    errorMsg.textContent = message;
    setTimeout(() => {
        errorMsg.textContent = '';
    }, 3000);
});

// Renderiza as cartas do jogador
function renderPlayerHand(cards) {
    playerHand.innerHTML = '';
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = `${card.value}${card.suit}`;
        cardElement.onclick = () => playCard(index);
        playerHand.appendChild(cardElement);
    });
}

// Jogar uma carta
function playCard(cardIndex) {
    socket.emit('play-card', {
        roomId: roomId,
        playerId: playerId,
        cardIndex: cardIndex
    });
}

// Inicialização
document.getElementById('join-section').style.display = 'none';
document.getElementById('room-info').style.display = 'none';
