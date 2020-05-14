// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START all]
const http = require('http');
const handleRequest = function (req, res) {
  res.writeHead(200);
  res.end('Hello Kubernetes!');
};
const www = http.createServer(handleRequest);
www.listen(process.env.PORT || 8080);

// [END all]
module.exports = www;
