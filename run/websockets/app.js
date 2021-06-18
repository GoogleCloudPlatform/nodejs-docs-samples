// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {
  REDISHOST,
  REDISPORT,
  getRoomFromCache,
  addMessageToCache,
} = require('./storage');
const {addUser, getUser, deleteUser} = require('./users');
const express = require('express');

const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

// Serve frontend
app.get('/', async (req, res) => {
  res.render('index');
});

// Initialize Socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);
const redis = require('socket.io-redis');
// Replace in-memory adapter with Redis
io.adapter(redis({host: REDISHOST, port: REDISPORT}));

// Listen for new connection
io.on('connection', socket => {
  // Add listener for "login" event
  socket.on('login', async ({name, room}, callback) => {
    try {
      // Record socket ID to user's name and chat room
      addUser(socket.id, name, room);
      // Call join to subscribe the socket to a given channel
      socket.join(room);
      // Emit notification event
      socket.in(room).emit('notification', {
        title: "Someone's here",
        description: `${name} just entered the room`,
      });
      // Send room's message history
      const messages = await getRoomFromCache(room);
      callback(null, messages);
    } catch (err) {
      callback(err, null);
    }
  });

  // Add listener for "reconnect" event
  socket.on('reconnect', async ({name, room}) => {
    try {
      addUser(socket.id, name, room);
      socket.join(room);
    } catch (err) {}
  });

  // Add listener for "sendMessage" event
  socket.on('sendMessage', (message, callback) => {
    // Retrieve user's name and chat room  from socket ID
    const {user, room} = getUser(socket.id);
    if (room) {
      const msg = {user, text: message};
      // Push message to clients in chat room
      io.in(room).emit('message', msg);
      addMessageToCache(room, msg);
      callback();
    } else {
      callback('User session not found.');
    }
  });

  // Add listener for disconnection
  socket.on('disconnect', () => {
    // Remove socket ID from list
    const {user, room} = deleteUser(socket.id);
    if (user) {
      io.in(room).emit('notification', {
        title: 'Someone just left',
        description: `${user} just left the room`,
      });
    }
  });
});

module.exports = server;