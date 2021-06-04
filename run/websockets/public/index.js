// Material Design functionality
mdc.textField.MDCTextField.attachTo(document.querySelector('.name'))
mdc.textField.MDCTextField.attachTo(document.querySelector('.room'))
mdc.ripple.MDCRipple.attachTo(document.querySelector('.signin'))
mdc.ripple.MDCRipple.attachTo(document.querySelector('.send'))

// Hide Chatroom on start
$(document).ready(function () {
  $('#chatroom').hide();
});

// Initialize Socket.io
var socket = io('', { 
  transports: ['websocket']
});

// On sign in
var name;
var room;
$('#signin').submit(e => {
  e.preventDefault();
  name = $('#name').val();
  room = $('#room').val();
  socket.emit('login', {name, room}, (error, history) => {
    if (error) {
      console.log(error);
    }
    if (history) addHistory(history.messages);
    setChatroom(room);
    $('#signin').hide();
    $('#chatroom').show();
    window.scrollTo(0, document.body.scrollHeight);
  });
});

// Send chat message
$('#chat').submit(e => {
  e.preventDefault();
  const msg = $('#msg').val();
  socket.emit('sendMessage', msg, (error) => {
    if (error) {
      console.log(error);
    } else {
      $('#msg').val('');
    }
  });
});

// Listen for new messages
socket.on('message', (msg) => {
  log(msg.user, msg.text);
});

// Listen for notifications
socket.on('notification', (msg) => {
  log(msg.title, msg.description);
});

// Show history in chat room
function addHistory(messages) {
  messages.forEach(message => {
    log(message.user, message.text)
  })
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

socket.on('connect', (err) => {
  console.log('connected');
})

socket.on('disconnect', (err) => {
  console.log('server disconnected: ', err)
})

socket.io.on('reconnect', () => {
  console.log('reconnected!')
  socket.emit('reconnect', {name, room}, (error) => {
    if (error) {
      console.log(error);
    }
  });
});