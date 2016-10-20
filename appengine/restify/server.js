/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START server]
const PORT = process.env.PORT || 8080;
const restify = require('restify');

const server = restify.createServer({
  name: 'appengine-restify',
  version: '1.0.0'
});
// [END server]

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', (req, res, next) => {
  res.send(req.params);
  next();
  return;
});

// [START index]
server.get('/', (req, res) => {
  res.send('Hello World! Restify.js on Google App Engine.');
});
// [END index]

// [START server_start]
server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
// [END server_start]
