const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://phenomenal-zabaione-e155d4.netlify.app","http://localhost:3002"],
    methods: ["GET", "POST"]
  }
});

let users = {};

io.on('connection', (socket) => {
  socket.on('register', (username) => {
    users[username] = socket.id;
    io.emit('users', Object.keys(users));
  });

  socket.on('send_message', (data) => {
    const targetSocketId = users[data.to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive_message', {
        from: data.from,
        message: data.message
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [username, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[username];
        break;
      }
    }
    io.emit('users', Object.keys(users));
  });
  
  socket.on('video-offer', (data) => {
    const targetSocketId = users[data.to];
    if (targetSocketId) io.to(targetSocketId).emit('video-offer', { from: data.from, offer: data.offer });
  });
  socket.on('video-answer', (data) => {
    const targetSocketId = users[data.to];
    if (targetSocketId) io.to(targetSocketId).emit('video-answer', { from: data.from, answer: data.answer });
  });
  socket.on('ice-candidate', (data) => {
    const targetSocketId = users[data.to];
    if (targetSocketId) io.to(targetSocketId).emit('ice-candidate', { from: data.from, candidate: data.candidate });
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});
// const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('Hello! The chat server is working.');
});

io.on('connection', (socket) => {
  console.log('A user connected');
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});