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

// [START quickstart]
// Import and instantiate the Google Cloud client library
// for Stackdriver Logging
var logging = require('@google-cloud/logging')({
  projectId: 'YOUR_PROJECT_ID'
});

// Select the log to write to
var log = logging.log('my-log');
// Prepare a log entry
var entry = log.entry({ type: 'global' }, 'Hello, world!');

// Write the log entry
log.write(entry, function (err, apiResponse) {
  if (!err) {
    // The entry was logged successfully.
  }
});
// [END quickstart]
