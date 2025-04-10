// Configuração do Firebase (substitua com seus dados)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "https://SEU_PROJETO.firebaseio.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Variáveis do jogo
let roomId = "";
let playerId = Math.random().toString(36).substring(2, 9);
let playerNumber = 0;
let gameData = {};

// Elementos da interface
const roomInput = document.getElementById("roomId");
const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const gameContainer = document.getElementById("game-container");
const lobbyContainer = document.getElementById("lobby");
const roomInfo = document.getElementById("roomInfo");

// Cria uma nova sala automaticamente ao carregar a página
window.onload = function() {
    createNewRoom();
};

function createNewRoom() {
    // Gera um ID de sala aleatório
    roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Configuração inicial da sala
    gameData = {
        players: { 1: playerId },
        currentPlayer: 1,
        hands: { 1: [], 2: [], 3: [], 4: [] },
        table: [],
        trucoValue: 1,
        status: "waiting"
    };
    
    // Envia para o Firebase
    database.ref(`rooms/${roomId}`).set(gameData)
        .then(() => {
            playerNumber = 1;
            
            // Mostra o ID da sala para compartilhar
            roomInfo.innerHTML = `
                <h3>Sala criada!</h3>
                <p>ID da Sala: <strong>${roomId}</strong></p>
                <p>Compartilhe este código com seus amigos</p>
                <p>Aguardando jogadores...</p>
            `;
            
            // Monitora mudanças na sala
            database.ref(`rooms/${roomId}`).on("value", (snapshot) => {
                gameData = snapshot.val();
                updateGameUI();
                
                // Inicia o jogo quando tiver 4 jogadores
                if (Object.keys(gameData.players).length === 4 && gameData.status === "waiting") {
                    startGame();
                }
            });
        });
}

function startGame() {
    // Muda o status do jogo
    database.ref(`rooms/${roomId}/status`).set("playing");
    
    // Distribui cartas (apenas o host faz isso)
    if (playerNumber === 1) {
        dealCards();
    }
    
    // Esconde o lobby e mostra o jogo
    lobbyContainer.style.display = "none";
    gameContainer.style.display = "block";
}

// ... (restante das funções permanece igual)
