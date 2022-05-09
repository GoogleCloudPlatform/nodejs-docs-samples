// Copyright 2022 Google LLC
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

// [START functions_structured_logging]
const {Logging} = require('@google-cloud/logging');
const functions = require('@google-cloud/functions-framework');
const pkg = require('./package.json');

functions.http('structuredLogging', async (req, res) => {
  // Initialize the logging client
  const logging = new Logging();
  // Required to capture your project id
  await logging.setProjectId();
  // Create a LogSync transport, defaulting to process.stdout
  const log = logging.logSync(pkg.name);
  const text = 'Hello, world!';
  // Create a structured log entry with severity,
  // additional component fields, and HTTP request.
  // Appending the httpRequest enables log correlation.
  const metadata = {
    severity: 'NOTICE',
    component: 'arbitrary-property',
    httpRequest: req,
  };
  // Prepares a log entry
  const entry = log.entry(metadata, text);
  log.write(entry);
  res.status(200).send('Success: A log message was written');
});
// [END functions_structured_logging]
