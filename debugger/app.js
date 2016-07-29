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
if (process.env.GCLOUD_PROJECT) {
  require('@google/cloud-debug');
}

var express = require('express');
var app = express();
app.enable('trust proxy');
// [END setup]

app.get('/', function (req, res) {
  // Try using the StackDriver Debugger dashboard to inspect the "req" object
  res.status(200).send('Hello, world!');
});

// Start the server
var server = app.listen(process.env.PORT || 8080, function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]

module.exports = app;
