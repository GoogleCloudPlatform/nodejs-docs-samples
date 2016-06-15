// Copyright 2016, Google, Inc.
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

// [START log]
exports.helloworld = function (context, data) {
  console.log('I am a log entry!');
  context.success();
};
// [END log]

exports.log = exports.helloworld;

// [START walkthrough_pubsub]
exports.helloworld = function (context, data) {
  console.log('My GCF Function: ' + data.message);
  context.success();
};
// [END walkthrough_pubsub]

// [START walkthrough_http]
exports.hellohttp = function (req, res) {
  // Use the response argument to send data back to the caller.
  res.send('My GCF Function: ' + req.body.message);
};
// [END walkthrough_http]
