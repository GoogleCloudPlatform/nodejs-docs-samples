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

// [START appengine_websockets_app]
const app = require('express')();
app.set('view engine', 'pug');

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.render('index.pug');
});

io.on('connection', socket => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});

if (module === require.main) {
  const PORT = parseInt(process.env.PORT) || 8080;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
// [END appengine_websockets_app]

module.exports = server;
