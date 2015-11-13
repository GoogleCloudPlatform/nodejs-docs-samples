// Copyright 2015, Google, Inc.
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

'use strict';

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemcachedStore = require('connect-memcached')(session);
var publicIp = require('public-ip');

var app = express();

app.use(cookieParser());
app.use(session({
  secret: 'your-secret-here',
  key: 'view:count',
  proxy: 'true',
  store: new MemcachedStore({
    hosts: [process.env.MEMCACHE_URL || '127.0.0.1:11211']
  })
}));

app.get('/', function(req, res){
  publicIp.v4(function (err, ip) {

    // This shows the IP for each 
    res.write('<div>' + ip + '</div>');

    if(req.session.views) {
      ++req.session.views;
    } else {
      req.session.views = 1;
    }
    res.end('Viewed <strong>' + req.session.views + '</strong> times.');
  });
});

if (module === require.main) {
  app.listen(process.env.PORT || 8080, function() {
    console.log('Listening on %d', this.address().port);
  });  
}

module.exports = app;
