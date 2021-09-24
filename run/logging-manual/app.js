// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  const project = process.env.GOOGLE_CLOUD_PROJECT;

  // [START cloudrun_manual_logging]
  // [START run_manual_logging]

  // Uncomment and populate this variable in your code:
  // $project = 'The project ID of your function or Cloud Run service';

  // Build structured log messages as an object.
  const globalLogFields = {};

  // Add log correlation to nest all log messages beneath request log in Log Viewer.
  // (This only works for HTTP-based invocations where `req` is defined.)
  if (typeof req !== 'undefined') {
    const traceHeader = req.header('X-Cloud-Trace-Context');
    if (traceHeader && project) {
      const [trace] = traceHeader.split('/');
      globalLogFields[
        'logging.googleapis.com/trace'
      ] = `projects/${project}/traces/${trace}`;
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

  // [END run_manual_logging]
  // [END cloudrun_manual_logging]

  res.send('Hello Logger!');
});

module.exports = app;
