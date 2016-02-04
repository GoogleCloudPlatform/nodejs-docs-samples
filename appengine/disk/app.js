// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

var fs = require('fs');
var util = require('util');
var express = require('express');
var crypto = require('crypto');

var app = express();
app.enable('trust proxy');

app.get('/', function(req, res, next) {
  var instanceId = process.env.GAE_MODULE_INSTANCE || '1';
  var hash = crypto.createHash('sha256');
  // Only store a hash of the ip address
  var ip = hash.update(req.ip).digest('hex').substr(0, 7);
  var userIp = util.format('%s\n', ip);

  fs.appendFile('/tmp/seen.txt', userIp, function(err) {
    if (err) { return next(err); }

    fs.readFile('/tmp/seen.txt', function(err, data) {
      if (err) { return next(err); }

      res.set('Content-Type', 'text/plain');
      res.status(200).send(util.format(
        'Instance: %s\n' +
        'Seen: \n%s', instanceId, data));
    });
  });
});

var server = app.listen(process.env.PORT || 8080, '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address,
    server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
