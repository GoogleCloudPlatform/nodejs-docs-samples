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
const memjs = require('memjs');

const app = express();

// [START client]
// Environment variables are defined in app.yaml.
let MEMCACHE_URL = process.env.MEMCACHE_URL || '127.0.0.1:11211';

if (process.env.USE_GAE_MEMCACHE) {
  MEMCACHE_URL = `${process.env.GAE_MEMCACHE_HOST}:${process.env.GAE_MEMCACHE_PORT}`;
}

const mc = memjs.Client.create(MEMCACHE_URL);
// [END client]

// [START example]
app.get('/', (req, res, next) => {
  mc.get('foo', (err, value) => {
    if (err) {
      next(err);
      return;
    }
    if (value) {
      res.status(200).send(`Value: ${value.toString('utf-8')}`);
      return;
    }

    mc.set('foo', `${Math.random()}`, (err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/');
    }, 60);
  });
});
// [END example]

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
