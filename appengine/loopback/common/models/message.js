'use strict';

module.exports = function(Message) {
  Message.greet = function(msg, cb) {
    process.nextTick(() => {
      msg = msg || 'hello';
      cb(null, 'Sender says ' + msg + ' to receiver');
    });
  };
};
