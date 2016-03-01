'use strict';

var express = require('express');
var http = require('http');
var Path = require('path');

module.exports = function startServer(port, path, callback) {
  var app = express();
  var server = http.createServer(app);

  app.use(express.static(Path.join(__dirname, path)));

  app.set('views', Path.join(__dirname, 'app/views'));
  app.set('view engine', 'jade');

  app.get('/', function(req, res) {
    res.render('index');
  });

  server.listen(port, callback);

};
