const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Active room tracking
const activeRooms = new Map(); // roomID => [user1, user2]

io.on('connection', socket => {
  console.log(`🟢 New connection: ${socket.id}`);

  socket.on('joinRoom', ({ username, room, avatar }) => {
    if (!room || !username || !avatar) {
      return socket.emit('errorMsg', 'Missing required fields.');
    }

    // Room doesn't exist yet
    if (!activeRooms.has(room)) {
      activeRooms.set(room, [username]);
      socket.join(room);
    } else {
      const users = activeRooms.get(room);

      // Check if room is full
      if (users.length >= 2) {
        socket.emit('message', {
          username: 'ChatBot',
          text: '❌ This Connect ID is already in use by 2 users. Please choose another.',
          avatar: 'chat-bot.png',
          time: new Date().toLocaleTimeString()
        });
        return;
      }
      

      // Avoid duplicate usernames
      if (users.includes(username)) {
        return socket.emit('errorMsg', 'Username already in room.');
      }

      users.push(username);
      activeRooms.set(room, users);
      socket.join(room);
    }

    // Attach room/user info to socket
    socket.username = username;
    socket.avatar = avatar;
    socket.room = room;

    // Welcome message
    socket.emit('message', {
      username: 'ChatBot',
      text: `Welcome to the chat, ${username}!`,
      avatar: 'chat-bot.png',
      time: new Date().toLocaleTimeString()
    });

    // Notify others
    socket.broadcast.to(room).emit('message', {
      username: 'ChatBot',
      text: `${username} has joined the chat.`,
      avatar: 'chat-bot.png',
      time: new Date().toLocaleTimeString()
    });

    // Send room user list
    io.to(room).emit('roomUsers', {
      room,
      users: activeRooms.get(room)
    });
  });

  socket.on('chatMessage', msg => {
    if (socket.room) {
      io.to(socket.room).emit('message', {
        username: socket.username,
        text: msg,
        avatar: socket.avatar,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  socket.on('disconnect', () => {
    const room = socket.room;
    const username = socket.username;

    if (room && activeRooms.has(room)) {
      const updatedUsers = activeRooms.get(room).filter(u => u !== username);

      if (updatedUsers.length === 0) {
        activeRooms.delete(room);
      } else {
        activeRooms.set(room, updatedUsers);
      }

      socket.to(room).emit('message', {
        username: 'ChatBot',
        text: `${username} has left the chat.`,
        avatar: 'chat-bot.png',
        time: new Date().toLocaleTimeString()
      });

      io.to(room).emit('roomUsers', {
        room,
        users: updatedUsers
      });
    }
  });
});

const PORT = process.env.PORT || 3004;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

