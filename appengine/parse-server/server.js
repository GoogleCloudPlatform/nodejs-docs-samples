// Copyright 2016, Google, Inc.
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

'use strict';

// [START app]
var express = require('express');
var nconf = require('nconf');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

nconf.argv().env().file({ file: 'config.json' });

var app = express();

var parseServer = new ParseServer({
  databaseURI: nconf.get('DATABASE_URI') || 'mongodb://localhost:27017/dev',
  cloud: nconf.get('CLOUD_PATH') || path.join(__dirname, '/cloud/main.js'),
  appId: nconf.get('APP_ID'),
  masterKey: nconf.get('MASTER_KEY'),
  fileKey: nconf.get('FILE_KEY'),
  serverURL: nconf.get('SERVER_URL')
});

// Mount the Parse API server middleware to /parse
app.use(process.env.PARSE_MOUNT_PATH || '/parse', parseServer);

app.get('/', function (req, res) {
  res.status(200).send('Hello, world!');
});

var server = app.listen(process.env.PORT || 8080, function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});

// [END app]
