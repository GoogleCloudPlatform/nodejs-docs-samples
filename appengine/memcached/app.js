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

// [START app]
'use strict';

const express = require('express');
const Memcached = require('memcached');

const app = express();

// The environment variables are automatically set by App Engine when running
// on GAE. When running locally, you should have a local instance of the
// memcached daemon running.
const memcachedAddr = process.env.MEMCACHE_PORT_11211_TCP_ADDR || 'localhost';
const memcachedPort = process.env.MEMCACHE_PORT_11211_TCP_PORT || '11211';
const memcached = new Memcached(`${memcachedAddr}:${memcachedPort}`);

app.get('/', (req, res, next) => {
  memcached.get('foo', (err, value) => {
    if (err) {
      next(err);
      return;
    }
    if (value) {
      res.status(200).send(`Value: ${value}`);
      return;
    }

    memcached.set('foo', Math.random(), 60, (err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/');
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
