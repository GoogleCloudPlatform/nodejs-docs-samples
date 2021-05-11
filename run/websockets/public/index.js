mdc.textField.MDCTextField.attachTo(document.querySelector('.name'))
mdc.textField.MDCTextField.attachTo(document.querySelector('.room'))
mdc.ripple.MDCRipple.attachTo(document.querySelector('.signin'))
mdc.ripple.MDCRipple.attachTo(document.querySelector('.send'))

$(document).ready(function () {
  console.log('ready!');
  $('#chatroom').hide();
});

var socket = io();
$('#signin').submit(e => {
  e.preventDefault();
  const name = $('#name').val();
  const room = $('#room').val();
  socket.emit('login', {name, room}, (error) => {
    if (error) {
      console.log(error);
    }
    $('#chatroom').show();
    $('#signin').hide();
  });
});

$('#chat').submit(e => {
  e.preventDefault();
  const msg = $('#msg').val();
  console.log(msg);
  socket.emit('sendMessage', msg, (error) => {
    if (error) {
      console.log(error);
    }
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

// window.scrollTo(0, document.body.scrollHeight);
function log(name, msg) {
  $('#messages').append(`<li> <strong>${name}</strong>: ${msg}`);
}
