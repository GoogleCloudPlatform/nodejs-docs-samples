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

'use strict';

// [START server]
var app = require('./index');
var http = require('http');

var server;

/*
 * Create and start HTTP server.
 */
server = http.createServer(app);
server.listen(process.env.PORT || 8080);
server.on('listening', function () {
  console.log('Server listening on http://localhost:%d', this.address().port);
});
// [END server]
