// Configurações do jogo
const suits = ["♠", "♥", "♦", "♣"];
const values = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"];
const manilhas = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"]; // Ordem de força

let deck = [];
let playerCards = [];
let opponentCards = [];
let tableCards = [];
let currentPlayer = "player1";
let points = { player1: 0, player2: 0 };
let trucoValue = 1;
let trucoActive = false;

// Inicializa o jogo
function initGame() {
    createDeck();
    shuffleDeck();
    dealCards();
    updateUI();
}

// Cria o baralho
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

// Embaralha as cartas
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Distribui as cartas
function dealCards() {
    playerCards = deck.slice(0, 3);
    opponentCards = deck.slice(3, 6);
    deck = deck.slice(6);
}

// Atualiza a interface
function updateUI() {
    document.getElementById("player1").textContent = `Você: ${points.player1} pontos`;
    document.getElementById("player2").textContent = `Oponente: ${points.player2} pontos`;

    // Mostra cartas do jogador
    const playerCardsDiv = document.getElementById("player-cards");
    playerCardsDiv.innerHTML = "";
    playerCards.forEach((card, index) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.textContent = `${card.value}${card.suit}`;
        cardDiv.onclick = () => playCard(index);
        playerCardsDiv.appendChild(cardDiv);
    });

    // Mostra cartas na mesa
    const tableDiv = document.getElementById("table");
    tableDiv.innerHTML = "";
    tableCards.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.textContent = `${card.value}${card.suit}`;
        tableDiv.appendChild(cardDiv);
    });
}

// Jogar uma carta
function playCard(index) {
    if (currentPlayer !== "player1") return;

    const card = playerCards[index];
    tableCards.push({ ...card, player: "player1" });
    playerCards.splice(index, 1);

    currentPlayer = "player2";
    updateUI();
    setTimeout(opponentPlay, 1000);
}

// Jogada do oponente (IA simples)
function opponentPlay() {
    if (opponentCards.length === 0) return;

    const randomIndex = Math.floor(Math.random() * opponentCards.length);
    const card = opponentCards[randomIndex];
    tableCards.push({ ...card, player: "player2" });
    opponentCards.splice(randomIndex, 1);

    currentPlayer = "player1";
    updateUI();
    checkRoundEnd();
}

// Verifica fim da rodada
function checkRoundEnd() {
    if (tableCards.length === 2) {
        setTimeout(() => {
            const card1 = tableCards[0];
            const card2 = tableCards[1];
            const winner = compareCards(card1, card2);
            
            if (winner === "player1") {
                document.getElementById("message").textContent = "Você ganhou a rodada!";
                points.player1 += trucoValue;
            } else {
                document.getElementById("message").textContent = "Oponente ganhou a rodada!";
                points.player2 += trucoValue;
            }

            trucoValue = 1;
            trucoActive = false;
            tableCards = [];
            updateUI();

            if (playerCards.length === 0 || opponentCards.length === 0) {
                setTimeout(initGame, 2000);
            }
        }, 1000);
    }
}

// Compara cartas (lógica simplificada)
function compareCards(card1, card2) {
    const rank1 = manilhas.indexOf(card1.value);
    const rank2 = manilhas.indexOf(card2.value);
    return rank1 > rank2 ? card1.player : card2.player;
}

// Botão Truco
document.getElementById("truco").onclick = () => {
    if (!trucoActive) {
        trucoActive = true;
        trucoValue = 3;
        document.getElementById("message").textContent = "Você pediu TRUCO!";
    }
};

// Botão Aceitar
document.getElementById("accept").onclick = () => {
    if (trucoActive) {
        document.getElementById("message").textContent = "Truco aceito! Valendo 3 pontos.";
    }
};

// Botão Correr
document.getElementById("run").onclick = () => {
    if (trucoActive) {
        points.player2 += 1;
        document.getElementById("message").textContent = "Você correu! Oponente ganha 1 ponto.";
        trucoActive = false;
        trucoValue = 1;
        updateUI();
    }
};

// Inicia o jogo
initGame();