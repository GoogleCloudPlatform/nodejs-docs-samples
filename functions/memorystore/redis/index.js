/**
 * Copyright 2019, Google LLC.
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

// [START functions_memorystore_redis]

const redis = require('redis');

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6379;

const redisClient = redis.createClient(REDISPORT, REDISHOST);
redisClient.on('error', err => console.error('ERR:REDIS:', err));

exports.visitCount = (req, res) => {
  redisClient.incr('visits', (err, reply) => {
    if (err) {
      console.log(err);
      res.status(500).send(err.message);
      return;
    }
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(`Visit count: ${reply}`);
  });
};

// [END functions_memorystore_redis]
