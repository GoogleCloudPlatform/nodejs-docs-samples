const { promisify } = require("util");
const redisClient = require('redis').createClient(
  process.env.REDISPORT,
  process.env.REDISHOST
);

async function addMessageToCache(roomName, msg) {
  let room = await getRoomFromCache(roomName);
  console.log(room)
  if (room) {
    room.messages.push(msg);
  } else {
    room = {
      room: roomName,
      messages: [msg]
    }
  }
  redisClient.set(roomName, JSON.stringify(room));
  addMessageToDb(room);
}

async function addMessageToDb(data) {
  const room = messageDb.find(messages => messages.room == data.room);
  if (room) {
    Object.assign(room, data);
  } else {
    messageDb.push(data);
  }
}

async function getRoomFromCache(roomName) {
  const redisGet = promisify(redisClient.get).bind(redisClient);
  const redisExists = promisify(redisClient.exists).bind(redisClient);
  if (!(await redisExists(roomName))) {
    const room = getRoomFromDatabase(roomName);
    console.log('from db', room);
    if (room) {
      redisClient.set(roomName, JSON.stringify(room));
    }
  }
  return JSON.parse(await redisGet(roomName));
}

function getRoomFromDatabase(roomName) {
  return messageDb.find(messages => messages.room == roomName);
}

const messageDb = [
  {
    room: 'my-room',
    messages: [
      {user: 'Chris', text: 'Hi!'},
      {user: 'Chris', text: 'How are you!?'},
      {user: 'Megan', text: 'Doing well!'},
      {user: 'Chris', text: 'That\'s great'},
    ],
  },
  {
    room: 'new-room',
    messages: [
      {user: 'Chris', text: 'The project is due tomorrow'},
      {user: 'Chris', text: 'I am wrapping up the final pieces'},
      {user: 'Chris', text: 'Are you ready for the presentation'},
      {user: 'Megan', text: 'Of course!'},
    ],
  },
];

module.exports = {
    getRoomFromCache,
    addMessageToCache
}