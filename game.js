// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Variáveis do jogo
let roomId = "";
let playerId = Math.random().toString(36).substring(2, 9);
let playerNumber = 0;
let gameData = {};
let players = {};

// Elementos da interface
const createSection = document.getElementById("create-section");
const joinSection = document.getElementById("join-section");
const roomInfo = document.getElementById("room-info");
const displayRoomId = document.getElementById("display-roomId");
const playerCount = document.getElementById("player-count");
const playerList = document.getElementById("player-list");
const waitingMessage = document.getElementById("waiting-message");

// Cria uma nova sala
document.getElementById("createRoom").addEventListener("click", () => {
    createSection.style.display = "none";
    joinSection.style.display = "none";
    roomInfo.style.display = "block";
    
    // Gera um ID de sala aleatório
    roomId = generateRoomId();
    displayRoomId.textContent = roomId;
    
    // Cria a sala no Firebase
    players = { 1: playerId };
    database.ref(`rooms/${roomId}`).set({
        players: players,
        status: "waiting",
        gameData: null
    });
    
    playerNumber = 1;
    monitorRoom();
});

// Entra em uma sala existente
document.getElementById("joinRoom").addEventListener("click", () => {
    roomId = document.getElementById("roomId").value.trim().toUpperCase();
    
    if (roomId.length !== 4) {
        alert("ID da sala deve ter 4 caracteres!");
        return;
    }
    
    database.ref(`rooms/${roomId}`).once("value").then(snapshot => {
        if (!snapshot.exists()) {
            alert("Sala não encontrada!");
            return;
        }
        
        const room = snapshot.val();
        if (Object.keys(room.players).length >= 4) {
            alert("Sala cheia!");
            return;
        }
        
        createSection.style.display = "none";
        joinSection.style.display = "none";
        roomInfo.style.display = "block";
        displayRoomId.textContent = roomId;
        
        // Determina o número do jogador
        playerNumber = Object.keys(room.players).length + 1;
        
        // Adiciona o jogador à sala
        database.ref(`rooms/${roomId}/players`).update({
            [playerNumber]: playerId
        });
        
        monitorRoom();
    });
});

// Monitora as mudanças na sala
function monitorRoom() {
    database.ref(`rooms/${roomId}`).on("value", snapshot => {
        const room = snapshot.val();
        
        if (!room) {
            alert("Sala foi fechada!");
            window.location.reload();
            return;
        }
        
        // Atualiza a lista de jogadores
        updatePlayerList(room.players);
        
        // Inicia o jogo quando tiver 4 jogadores
        if (Object.keys(room.players).length === 4 && room.status === "waiting") {
            startGame();
        }
    });
}

// Atualiza a lista de jogadores na interface
function updatePlayerList(players) {
    const playerCountNum = Object.keys(players).length;
    playerCount.textContent = `${playerCountNum}/4`;
    
    playerList.innerHTML = "";
    for (const [number, id] of Object.entries(players)) {
        const playerElement = document.createElement("div");
        playerElement.textContent = `Jogador ${number}: ${id === playerId ? "Você" : "Conectado"}`;
        playerList.appendChild(playerElement);
    }
    
    if (playerCountNum === 4) {
        waitingMessage.textContent = "Sala completa! Preparando o jogo...";
    }
}

// Inicia o jogo
function startGame() {
    // Atualiza o status da sala
    database.ref(`rooms/${roomId}`).update({
        status: "playing"
    });
    
    // Só o jogador 1 distribui as cartas
    if (playerNumber === 1) {
        const deck = createShuffledDeck();
        const hands = {
            1: deck.slice(0, 3),
            2: deck.slice(3, 6),
            3: deck.slice(6, 9),
            4: deck.slice(9, 12)
        };
        
        database.ref(`rooms/${roomId}`).update({
            gameData: {
                hands: hands,
                table: [],
                currentPlayer: 1,
                trucoValue: 1
            }
        });
    }
    
    // Esconde o lobby e mostra o jogo
    document.getElementById("lobby").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    
    // Começa a monitorar o jogo
    monitorGame();
}

// Gera um ID de sala aleatório (4 letras/números)
function generateRoomId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
