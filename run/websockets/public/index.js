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

// Material Design functionality
mdc.textField.MDCTextField.attachTo(document.querySelector('.name'));
mdc.textField.MDCTextField.attachTo(document.querySelector('.room'));
mdc.ripple.MDCRipple.attachTo(document.querySelector('.signin'));
mdc.ripple.MDCRipple.attachTo(document.querySelector('.send'));

// Hide Chatroom on start
$(document).ready(() => {
  $('#chatroom').hide();
});

// [START cloudrun_websockets_initialization]
// Initialize Socket.io
const socket = io('', {
  transports: ['websocket'],
});
// [END cloudrun_websockets_initialization]

// Initialize global variables for connection and reconnection
let user;
let room;
// Submit signin form
$('#signin').submit(e => {
  e.preventDefault();
  user = $('#name').val();
  room = $('#room').val();
  // Emit "signin" event with user name and chat room
  socket.emit('signin', {user, room}, (error, history) => {
    if (error) {
      console.error(error);
    } else {
      // The history callback includes message history
      if (history) addHistory(history.messages);
      // Load chat room messages
      setChatroom(room);
      $('#signin').hide();
      $('#chatroom').show();
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
});

// Submit chat message
$('#chat').submit(e => {
  e.preventDefault();
  const msg = $('#msg').val();
  // [START cloudrun_websockets_emit]
  // Emit "sendMessage" event with message
  socket.emit('sendMessage', msg, error => {
    if (error) {
      console.error(error);
    } else {
      // Clear message
      $('#msg').val('');
    }
  });
  // [END cloudrun_websockets_emit]
});

// [START cloudrun_websockets_listen]
// Listen for new messages
socket.on('message', msg => {
  log(msg.user, msg.text);
});

// Listen for notifications
socket.on('notification', msg => {
  log(msg.title, msg.description);
});

// Listen connect event
socket.on('connect', () => {
  console.log('connected');
});
// [END cloudrun_websockets_listen]

// Listen for disconnect event
socket.on('disconnect', err => {
  console.log('server disconnected: ', err);
  if (err === 'io server disconnect') {
    // Reconnect manually if the disconnection was initiated by the server
    socket.connect();
  }
});

// [START cloudrun_websockets_reconnect]
// Listen for reconnect event
socket.io.on('reconnect', () => {
  console.log('reconnected');
  // Emit "updateSocketId" event to update the recorded socket ID with user and room
  socket.emit('updateSocketId', {user, room}, error => {
    if (error) {
      console.error(error);
    }
  });
});
// [END cloudrun_websockets_reconnect]

// Add message history in chat room
function addHistory(messages) {
  messages.forEach(message => {
    log(message.user, message.text);
  });
}

// Helper function to set chatroom name
function setChatroom(room) {
  $('#chatroom h1').append(room);
}

// Helper function to print to chatroom
function log(name, msg) {
  $('#messages').append(`<li> <strong>${name}</strong>: ${msg}`);
  window.scrollTo(0, document.body.scrollHeight);
}
