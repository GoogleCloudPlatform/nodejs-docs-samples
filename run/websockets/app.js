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

const express = require('express');
const {redisClient, getRoomFromCache, addMessageToCache} = require('./redis');
const {addUser, getUser, deleteUser, validateMessage} = require('./users');

const MAX_HTTP_BUFFER_SIZE = 1e4; // 10 KB
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const RATE_LIMIT_MAX_MESSAGES = 20;

// Sliding-window rate limiter scoped to a single socket connection
function createRateLimiter(
  maxMessages = RATE_LIMIT_MAX_MESSAGES,
  windowMs = RATE_LIMIT_WINDOW_MS
) {
  const timestamps = [];
  return () => {
    const now = Date.now();
    while (timestamps.length > 0 && now - timestamps[0] >= windowMs) {
      timestamps.shift();
    }
    if (timestamps.length >= maxMessages) {
      return false;
    }
    timestamps.push(now);
    return true;
  };
}

const app = express();
app.use(express.static(__dirname + '/public'));

// Serve frontend
app.get('/', async (req, res) => {
  res.render('index');
});

// [START cloudrun_websockets_server]
// Initialize Socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
});

// [START cloudrun_websockets_redis_adapter]
const {createAdapter} = require('@socket.io/redis-adapter');
// Replace in-memory adapter with Redis
const subClient = redisClient.duplicate();
io.adapter(createAdapter(redisClient, subClient));
// [END cloudrun_websockets_redis_adapter]
// Add error handlers
redisClient.on('error', err => {
  console.error(err.message);
});

subClient.on('error', err => {
  console.error(err.message);
});

// Listen for new connection
io.on('connection', socket => {
  const allowMessage = createRateLimiter();

  // Add listener for "signin" event
  socket.on('signin', async (payload, callback) => {
    const cb = typeof callback === 'function' ? callback : () => {};
    try {
      const {user, room} =
        payload && typeof payload === 'object' ? payload : {};
      const previous = getUser(socket.id);
      // Record socket ID to user's name and chat room
      const {user: sanitizedUser, room: sanitizedRoom} = addUser(
        socket.id,
        user,
        room
      );
      if (previous.room && previous.room !== sanitizedRoom) {
        socket.leave(previous.room);
      }
      // Call join to subscribe the socket to a given channel
      socket.join(sanitizedRoom);
      // Emit notification event
      socket.in(sanitizedRoom).emit('notification', {
        title: "Someone's here",
        description: `${sanitizedUser} just entered the room`,
      });
      // Retrieve room's message history or return null
      const messages = await getRoomFromCache(sanitizedRoom);
      // Use the callback to respond with the room's message history
      // Callbacks are more commonly used for event listeners than promises
      cb(null, messages);
    } catch (err) {
      cb(err.message || 'Sign-in failed.', null);
    }
  });

  // [START cloudrun_websockets_update_socket]
  // Add listener for "updateSocketId" event
  socket.on('updateSocketId', async (payload, callback) => {
    const cb = typeof callback === 'function' ? callback : () => {};
    try {
      const {user, room} =
        payload && typeof payload === 'object' ? payload : {};
      const previous = getUser(socket.id);
      const {room: sanitizedRoom} = addUser(socket.id, user, room);
      if (previous.room && previous.room !== sanitizedRoom) {
        socket.leave(previous.room);
      }
      socket.join(sanitizedRoom);
      cb(null);
    } catch (err) {
      console.error(err);
      cb(err.message || 'Failed to update session.');
    }
  });
  // [END cloudrun_websockets_update_socket]

  // Add listener for "sendMessage" event
  socket.on('sendMessage', async (message, callback) => {
    const cb = typeof callback === 'function' ? callback : () => {};
    // Retrieve user's name and chat room from socket ID
    const {user, room} = getUser(socket.id);
    if (!room) {
      cb('User session not found.');
      return;
    }
    if (!allowMessage()) {
      cb('Rate limit exceeded. Please wait before sending more messages.');
      return;
    }
    let sanitizedMessage;
    try {
      sanitizedMessage = validateMessage(message);
    } catch (err) {
      cb(err.message);
      return;
    }
    const msg = {user, text: sanitizedMessage};
    // Push message to clients in chat room
    io.in(room).emit('message', msg);
    try {
      await addMessageToCache(room, msg);
    } catch (err) {
      console.error(err);
    }
    cb();
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
// [END cloudrun_websockets_server]

module.exports = server;
