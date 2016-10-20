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
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
// [END setup]

app.post('/echo', function (req, res) {
  res.status(200).json({ message: req.body.message });
});

function authInfoHandler (req, res) {
  var authUser = { id: 'anonymous' };
  var encodedInfo = req.get('X-Endpoint-API-UserInfo');
  if (encodedInfo) {
    authUser = JSON.parse(new Buffer(encodedInfo, 'base64'));
  }
  res.status(200).json(authUser);
}

app.get('/auth/info/googlejwt', authInfoHandler);
app.get('/auth/info/googleidtoken', authInfoHandler);

// [START listen]
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log('App listening on port %s', PORT);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
