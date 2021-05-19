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
const { promisify } = require("util");
const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

app.get('/', async (req, res) => {
  const messages = await getMessagesFromCache();
  console.log('cache', await getMessagesFromCache());
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
    // console.log(user)
    if (user.room) {
      console.log(user.room, {user: user.name, text: message});
      addMessageToCache({user: user.name, message, room: user.room});
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

const redisClient = require('redis').createClient(
  process.env.REDISPORT,
  process.env.REDISHOST
);
async function addMessageToCache(msg) {
  const room = await getUserFromCache(msg.room);
  if (room) {
    const msgs = await getRoomFromCache(room);
  } else {
    const msgs = [msg];
  }
  redisClient.set(msg.room, msgs)
  addMessageToDb(msg)
}

async function getRoomFromCache(room) {
  const redisGet = promisify(redisClient.get).bind(redisClient);
  const redisExists = promisify(redisClient.exists).bind(redisClient);
  if (! await redisExists(room)) {
    const room = await getRoomFromDatabase(id);
    // if (room) {
    //   redisClient.set(room, JSON.stringify(artist));
    // }
  }
  return JSON.parse(await redisGet(room))
}

async function getMessagesFromCache() {
  const redisKeys = promisify(redisClient.keys).bind(redisClient);
  const redisGet = promisify(redisClient.get).bind(redisClient);
  const ids = await redisKeys('*');
  const messagesInCache = [];
  console.log('ids', ids)
  if (ids) {
    for (let id of ids) {
      const msg = JSON.parse(await redisGet(id));
      messagesInCache.push(msg);
    }
  }
  return messagesInCache;
}

async function getMessagesFromDb() {
  return messageDb;
}

async function addMessageToDb(msg) {
  messageDb.push(msg);
}

const messageDb = [
  {
    room: "my-room",
    messages: [
      {user: 'Averi', message: 'Hello World'},
      {user: 'Averi', message: 'Hello World2'},
      {user: 'Averi', message: 'Hello World3'},
      {user: 'Megan', message: 'Hello World5'},
    ]
  },
  {
    room: "new-room",
    messages: [
      {user: 'Averi', message: 'XXHello World'},
      {user: 'Averi', message: 'XXHello World2'},
      {user: 'Averi', message: 'XXHello World3'},
      {user: 'Megan', message: 'XXHello World5'},
    ]
  },
  
]

module.exports = server;
