const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "https://trucodm.netlify.app", // Altere para seu URL
        methods: ["GET", "POST"]
    }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);

    socket.on('create-room', ({ roomId, playerId }) => {
        rooms[roomId] = {
            players: [playerId],
            gameStarted: false
        };
        socket.join(roomId);
        socket.emit('room-created', { roomId });
    });

    socket.on('join-room', ({ roomId, playerId }) => {
        if (!rooms[roomId]) {
            socket.emit('error', 'Sala não encontrada!');
            return;
        }
        if (rooms[roomId].players.length >= 4) {
            socket.emit('error', 'Sala cheia (4/4 jogadores)');
            return;
        }
        
        rooms[roomId].players.push(playerId);
        socket.join(roomId);
        
        io.to(roomId).emit('player-joined', { 
            players: rooms[roomId].players 
        });

        if (rooms[roomId].players.length === 4) {
            io.to(roomId).emit('game-started');
            rooms[roomId].gameStarted = true;
        }
    });

    socket.on('disconnect', () => {
        console.log('Jogador desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
