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
let playerNumber = 0; // 1-4
let gameData = {};

// Elementos da interface
const playerAreas = {
    1: document.querySelector("#player1 .hand"),
    2: document.querySelector("#player2 .hand"),
    3: document.querySelector("#player3 .hand"),
    4: document.querySelector("#player4 .hand")
};
const table = document.getElementById("table");

// Conecta ao jogo
function joinGame() {
    roomId = prompt("Digite o ID da sala:") || "truco-default";
    database.ref(`rooms/${roomId}`).once("value").then(snapshot => {
        if (!snapshot.exists()) {
            createNewGame();
        } else {
            connectToExistingGame(snapshot.val());
        }
    });
}

function createNewGame() {
    playerNumber = 1;
    gameData = {
        players: { 1: playerId },
        currentPlayer: 1,
        hands: { 1: [], 2: [], 3: [], 4: [] },
        table: [],
        trucoValue: 1
    };
    database.ref(`rooms/${roomId}`).set(gameData);
    startGame();
}

function connectToExistingGame(data) {
    const players = data.players;
    if (Object.keys(players).length >= 4) {
        alert("Sala cheia!");
        return;
    }
    
    playerNumber = Object.keys(players).length + 1;
    players[playerNumber] = playerId;
    
    database.ref(`rooms/${roomId}/players`).set(players);
    startGame();
}

function startGame() {
    // Distribui cartas (apenas o host faz isso)
    if (playerNumber === 1) {
        dealCards();
    }
    
    // Observa mudanças no jogo
    database.ref(`rooms/${roomId}`).on("value", snapshot => {
        gameData = snapshot.val();
        updateGameUI();
    });
}

function dealCards() {
    const deck = createShuffledDeck();
    const hands = {
        1: deck.slice(0, 3),
        2: deck.slice(3, 6),
        3: deck.slice(6, 9),
        4: deck.slice(9, 12)
    };
    database.ref(`rooms/${roomId}/hands`).set(hands);
}

function updateGameUI() {
    // Atualiza cartas de cada jogador
    for (let i = 1; i <= 4; i++) {
        updatePlayerHand(i, gameData.hands[i]);
    }
    
    // Atualiza mesa
    updateTable();
    
    // Destaque para o jogador atual
    document.querySelectorAll(".player-area").forEach(el => {
        el.style.border = "none";
    });
    document.querySelector(`#player${gameData.currentPlayer}`).style.border = "2px solid gold";
}

function updatePlayerHand(playerNum, cards) {
    const area = playerAreas[playerNum];
    area.innerHTML = "";
    
    // Se for o jogador atual, mostra cartas clicáveis
    if (playerNum === playerNumber) {
        cards.forEach((card, index) => {
            const cardEl = createCardElement(card);
            cardEl.onclick = () => playCard(index);
            area.appendChild(cardEl);
        });
    } else {
        // Para outros jogadores, mostra apenas o número de cartas
        cards.forEach(() => {
            const cardBack = document.createElement("div");
            cardBack.className = "card";
            cardBack.style.background = "#333";
            area.appendChild(cardBack);
        });
    }
}

function updateTable() {
    table.innerHTML = "";
    gameData.table.forEach(card => {
        const cardEl = createCardElement(card);
        cardEl.classList.add("card-played");
        table.appendChild(cardEl);
    });
}

function createCardElement(card) {
    const el = document.createElement("div");
    el.className = "card";
    el.textContent = `${card.value}${card.suit}`;
    
    // Cores diferentes para naipes
    if (card.suit === "♥" || card.suit === "♦") {
        el.style.color = "red";
    }
    
    return el;
}

function playCard(cardIndex) {
    if (gameData.currentPlayer !== playerNumber) return;
    
    const card = gameData.hands[playerNumber][cardIndex];
    
    // Atualiza o estado do jogo
    database.ref(`rooms/${roomId}`).update({
        [`hands/${playerNumber}`]: firebase.database.ServerValue.arrayRemove(card),
        table: [...gameData.table, { ...card, player: playerNumber }],
        currentPlayer: playerNumber % 4 + 1
    });
}

// Inicia o jogo quando a página carrega
window.onload = joinGame;
