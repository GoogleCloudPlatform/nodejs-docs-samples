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

const redis = require('redis');
const http = require('http');
const nconf = require('nconf');

// read in keys and secrets. You can store these in a variety of ways.
// I like to use a keys.json file that is in the .gitignore file,
// but you can also store them in environment variables
nconf
  .argv()
  .env()
  .file('keys.json');

// [START gae_flex_node_redis]
// Connect to a redis server provisioned over at
// Redis Labs. See the README for more info.
const client = redis
  .createClient(
    nconf.get('redisPort') || '6379',
    nconf.get('redisHost') || '127.0.0.1',
    {
      auth_pass: nconf.get('redisKey'),
      return_buffers: true,
    }
  )
  .on('error', err => console.error('ERR:REDIS:', err));
// [END gae_flex_node_redis]]

// Create a simple little server.
http
  .createServer((req, res) => {
    // Track every IP that has visited this site
    const listName = 'IPs';
    client.lpush(listName, req.connection.remoteAddress);
    client.ltrim(listName, 0, 25);

    // push out a range
    let iplist = '';
    client.lrange(listName, 0, -1, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err.message);
        return;
      }

      data.forEach(ip => {
        iplist += `${ip}; `;
      });

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(iplist);
    });
  })
  .listen(process.env.PORT || 8080);

console.log('started web process');
