const express = require('express');
const http = require('http');

const path = require('path');
const sockerio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = sockerio(server);

const {
  generateMessage,
  generateLocationMessage,
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils');

const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory)); // set up path to static files

io.on('connection', (socket) => {
  console.log('New websocket connection');

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Welcome, stranger!'));
    socket.broadcast.to(room).emit('message', generateMessage(`${username} has connected!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback();
  });
  socket.on('sendMesaage', (msg, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed');
    }

    io.to(user.room).emit('message', generateMessage(msg, user.username));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user.id) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left :(`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });

  socket.on('sendLocation', (position, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(position, user.username));
    callback(true);
  });
});

app.get('/', (req, res) => {
  res.render('index', {
    msg: 'Chat appsdfgs',
  });
});

module.exports = { app, server };
