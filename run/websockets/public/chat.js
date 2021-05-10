$(document).ready(function () {
  console.log('ready!');
  $('#chatroom').hide();
});

var socket = io();
$('#signin').submit(e => {
  e.preventDefault();
  const name = $('#name').val();
  const room = $('#room').val();
  socket.emit('login', {name, room}, error => {
    if (error) {
      console.log(error);
    }
    console.log(name, room);
    $('#chatroom').show();
    $('#signin').hide();
    // return false;
  });
});

$('#chat').submit(e => {
  e.preventDefault();
  const msg = $('#msg').val();
  console.log(msg);
  socket.emit('sendMessage', msg, error => {
    if (error) {
      console.log(error);
    }
    // return false;
  });
});

socket.on('message', (msg) => {
  console.log(msg);
  log(msg.user, msg.text);
});

socket.on('notification', (msg) => {
  console.log(msg);
  log(msg.title, msg.description);
});

function log(name, msg) {
  $('#messages').append(`<li> <strong>${name}</strong>: ${msg}`);
  // window.scrollTo(0, document.body.scrollHeight);
}