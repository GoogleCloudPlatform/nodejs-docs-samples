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

if (process.env.NODE_ENV === 'production') {
  require('@google/cloud-trace').start();
}

var request = require('request');
var express = require('express');
var app = express();
var DISCOVERY_URL = 'https://www.googleapis.com/discovery/v1/apis';

// This incoming HTTP request should be captured by Trace
app.get('/', function (req, res) {
  // This outgoing HTTP request should be captured by Trace
  request({
    url: DISCOVERY_URL,
    json: true
  }, function (err, response, body) {
    if (err) {
      return res.status(500).end();
    }
    var names = body.items.map(function (item) {
      return item.name;
    });
    return res.status(200).send(names.join('\n'));
  });
});

// Start the server
var server = app.listen(process.env.PORT || '8080', function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
