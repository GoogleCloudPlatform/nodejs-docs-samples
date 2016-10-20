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

// [START setup]
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MemcachedStore = require('connect-memcached')(session);
const publicIp = require('public-ip');
const crypto = require('crypto');

let MEMCACHE_URL = process.env.MEMCACHE_URL;
if (!MEMCACHE_URL) {
  if (process.env.MEMCACHE_PORT_11211_TCP_ADDR && process.env.MEMCACHE_PORT_11211_TCP_PORT) {
    MEMCACHE_URL = `${process.env.MEMCACHE_PORT_11211_TCP_ADDR}:${process.env.MEMCACHE_PORT_11211_TCP_PORT}`;
  } else {
    MEMCACHE_URL = '127.0.0.1:11211';
  }
}

const app = express();
app.enable('trust proxy');
// [END setup]

app.use(cookieParser());
app.use(session({
  secret: 'your-secret-here',
  key: 'view:count',
  proxy: 'true',
  store: new MemcachedStore({
    hosts: [MEMCACHE_URL]
  })
}));

app.get('/', (req, res, next) => {
  // Discover requester's public IP address
  publicIp.v4().then((ip) => {
    const userIp = crypto.createHash('sha256').update(ip).digest('hex').substr(0, 7);

    // This shows the hashed IP for each
    res.write(`<div>${userIp}</div>`);

    if (req.session.views) {
      req.session.views += 1;
    } else {
      req.session.views = 1;
    }
    res.end(`Viewed <strong>${req.session.views}</strong> times.`);
  }).catch(next);
});

// [START listen]
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('App listening on port %s', PORT);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
