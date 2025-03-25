// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  const project = process.env.GOOGLE_CLOUD_PROJECT;

  // [START cloudrun_manual_logging]

  // Uncomment and populate this variable in your code:
  // const project = 'The project ID of your function or Cloud Run service';

  // Build structured log messages as an object.
  const globalLogFields = {};

  // Add log correlation to nest all log messages beneath request log in Log Viewer.
  // (This only works for HTTP-based invocations where `req` is defined.)
  if (typeof req !== 'undefined') {
    const traceHeader = req.header('X-Cloud-Trace-Context');
    if (traceHeader && project) {
      const [trace] = traceHeader.split('/');
      globalLogFields['logging.googleapis.com/trace'] =
        `projects/${project}/traces/${trace}`;
    }
  }

  // Complete a structured log entry.
  const entry = Object.assign(
    {
      severity: 'NOTICE',
      message: 'This is the default display field.',
      // Log viewer accesses 'component' as 'jsonPayload.component'.
      component: 'arbitrary-property',
    },
    globalLogFields
  );

  // Serialize to a JSON string and output.
  console.log(JSON.stringify(entry));

  // [END cloudrun_manual_logging]

  res.send('Hello Logger!');
});

module.exports = app;
