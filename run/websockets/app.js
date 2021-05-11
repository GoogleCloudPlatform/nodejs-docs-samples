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
const {addUser, getUser, deleteUser, getUsers} = require('./users');
const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

app.get('/', (req, res) => {
  const messages = [{user: "averi", msg: "test"}, {user: "averi", msg: "test"}];
  res.render('index', {messages});
});

const server = require('http').Server(app);
const io = require('socket.io')(server);

const redis = require("socket.io-redis");
io.adapter(redis({ host: REDISHOST, port: REDISPORT }));

io.on('connection', socket => {
  socket.on('login', ({name, room}, callback) => {
    const user = addUser(socket.id, name, room);
    socket.join(user.room);
    socket
      .in(room)
      .emit('notification', {
        title: "Someone's here",
        description: `${user.name} just entered the room`,
      });
    io.in(room).emit('users', getUsers(room));
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    console.log(user)
    if (user.room) {
      console.log(user.room, {user: user.name, text: message})
      io.in(user.room).emit('message', {user: user.name, text: message});
    }
    callback();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    const user = deleteUser(socket.id);
    if (user) {
      io.in(user.room).emit('notification', {
        title: 'Someone just left',
        description: `${user.name} just left the room`,
      });
      io.in(user.room).emit('users', getUsers(user.room));
    }
  });
});

module.exports = server;
