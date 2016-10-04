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

// [START setup]
var express = require('express');
var winston = require('winston');

var app = express();
var logFile = '/var/log/app_engine/custom_logs/myapp.errors.log.json';

winston.add(winston.transports.File, {
  filename: logFile
});
// [END setup]

function report (err, req) {
  var payload = {
    message: err.stack,
    context: {
      httpRequest: {
        url: req.originalUrl,
        method: req.method,
        referrer: req.header('Referer'),
        userAgent: req.header('User-Agent'),
        remoteIp: req.ip,
        responseStatusCode: 500
      }
    }
  };
  winston.error(payload);
}

app.get('/', function (req, res, next) {
  next(new Error('something is wrong!'));
});

app.use(function (err, req, res, next) {
  report(err, req);
  res.status(500).send(err.message || 'Something broke!');
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

