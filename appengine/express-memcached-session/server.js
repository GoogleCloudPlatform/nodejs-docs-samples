// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

// [START setup]
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemcachedStore = require('connect-memcached')(session);
var publicIp = require('public-ip');
var crypto = require('crypto');

var app = express();
app.enable('trust proxy');
// [END setup]

app.use(cookieParser());
app.use(session({
  secret: 'your-secret-here',
  key: 'view:count',
  proxy: 'true',
  store: new MemcachedStore({
    hosts: [process.env.MEMCACHE_URL || '127.0.0.1:11211']
  })
}));

app.get('/', function (req, res, next) {
  // Discover requester's public IP address
  publicIp.v4(function (err, ip) {
    if (err) {
      return next(err);
    }
    var userIp = crypto.createHash('sha256').update(ip).digest('hex').substr(0, 7);

    // This shows the hashed IP for each
    res.write('<div>' + userIp + '</div>');

    if (req.session.views) {
      req.session.views += 1;
    } else {
      req.session.views = 1;
    }
    res.end('Viewed <strong>' + req.session.views + '</strong> times.');
  });
});

// [START listen]
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log('App listening on port %s', PORT);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
