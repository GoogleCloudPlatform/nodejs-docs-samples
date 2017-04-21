/**
 * Copyright 2017, Google, Inc.
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

'use strict';

// [START logging_quickstart]
// Imports the Google Cloud client library
const Logging = require('@google-cloud/logging');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Instantiates a client
const loggingClient = Logging({
  projectId: projectId
});

// The name of the log to write to
const logName = 'my-log';
// Selects the log to write to
const log = loggingClient.log(logName);

// The data to write to the log
const text = 'Hello, world!';
// The metadata associated with the entry
const metadata = { resource: { type: 'global' } };
// Prepares a log entry
const entry = log.entry(metadata, text);

// Writes the log entry
log.write(entry)
  .then(() => {
    console.log(`Logged: ${text}`);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
// [END logging_quickstart]
