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

// [START functions_structured_logging_event]
const {Logging} = require('@google-cloud/logging');
const functions = require('@google-cloud/functions-framework');
const pkg = require('./package.json');

functions.cloudEvent('structuredLoggingEvent', async () => {
  // Initialize the logging client
  const logging = new Logging();
  // Create a LogSync transport, defaulting to process.stdout
  const log = logging.logSync(pkg.name);
  // Required to capture your project id
  await logging.setProjectId();
  const text = 'Hello, world!';
  const entry = log.entry(
    {
      component: 'arbitrary-property',
    },
    text
  );
  // Indicates severity using error()
  log.error(entry);
});
// [END functions_structured_logging_event]
