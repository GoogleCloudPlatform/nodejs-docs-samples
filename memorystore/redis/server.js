/**
 * Copyright 2018 Google, Inc.
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
// [START memorystore_server_js]
'use strict';
const http = require('http');
const redis = require('redis');

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const client = redis.createClient(REDISPORT, REDISHOST);
client.on('error', err => console.error('ERR:REDIS:', err));

// create a server
http
  .createServer((req, res) => {
    // increment the visit counter
    client.incr('visits', (err, reply) => {
      if (err) {
        console.log(err);
        res.status(500).send(err.message);
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(`Visitor number: ${reply}\n`);
    });
  })
  .listen(8080);
// [END memorystore_server_js]
