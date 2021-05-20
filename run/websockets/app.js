// Copyright 2018 Google LLC
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

'use strict';
const express = require('express');
const {addUser, getUser, deleteUser} = require('./users');
const {getRoomFromCache, addMessageToCache} = require('./storage')
const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

app.get('/', async (req, res) => {
  res.render('index');
});

const server = require('http').Server(app);
const io = require('socket.io')(server);

const redis = require("socket.io-redis");
io.adapter(redis({ host: REDISHOST, port: REDISPORT }));

io.on('connection', socket => {
  socket.on('login', async ({name, room}, callback) => {
    addUser(socket.id, name, room);
    socket.join(room);
    socket
      .in(room)
      .emit('notification', {
        title: "Someone's here",
        description: `${name} just entered the room`,
      });

    const messages = await getRoomFromCache(room);
    callback(null, messages);
  });

  socket.on('sendMessage', (message, callback) => {
    const {user, room} = getUser(socket.id);
    if (room) {
      const msg = {user, text: message};
      io.in(room).emit('message', msg);
      addMessageToCache(room, msg);
    }
    callback();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    const {user, room} = deleteUser(socket.id);
    if (user) {
      io.in(room).emit('notification', {
        title: 'Someone just left',
        description: `${user} just left the room`,
      });
    }
  });

  socket.on('error', function (err) {
    console.log('received error from client:', socket.id);
    console.log(err);
  })
  socket.on('connect_error', function (err) {
    console.log('received error:', err);
  })
});


module.exports = server;
