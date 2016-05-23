// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

var http = require('http');
var express = require('express');
var request = require('request');

var app = express();
app.set('view engine', 'jade');

// Use express-ws to enable web sockets.
require('express-ws')(app);

// A simple echo service.
app.ws('/echo', function (ws) {
  ws.on('message', function (msg) {
    ws.send(msg);
  });
});

app.get('/', function (req, res) {
  getExternalIp(function (externalIp) {
    res.render('index.jade', {externalIp: externalIp});
  });
});

// [START external_ip]
// In order to use websockets on App Engine, you need to connect directly to
// application instance using the instance's public external IP. This IP can
// be obtained from the metadata server.
var METADATA_NETWORK_INTERFACE_URL = 'http://metadata/computeMetadata/v1/' +
    '/instance/network-interfaces/0/access-configs/0/external-ip';

function getExternalIp (cb) {
  var options = {
    url: METADATA_NETWORK_INTERFACE_URL,
    headers: {
      'Metadata-Flavor': 'Google'
    }
  };

  request(options, function (err, resp, body) {
    if (err || resp.statusCode !== 200) {
      console.log('Error while talking to metadata server, assuming localhost');
      return cb('localhost');
    }
    return cb(body);
  });
}
// [END external_ip]

// Start the websocket server
var wsServer = app.listen('65080', function () {
  console.log('Websocket server listening on port %s', wsServer.address().port);
});

// Additionally listen for non-websocket connections on the default App Engine
// port 8080. Using http.createServer will skip express-ws's logic to upgrade
// websocket connections.
var server = http.createServer(app).listen(process.env.PORT || '8080', function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
