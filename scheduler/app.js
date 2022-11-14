// Copyright 2018 Google LLC
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

// [START cloud_scheduler_app]
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.raw());

// Define relative URI for job endpoint
app.post('/log_payload', (req, res) => {
  // Log the job payload
  const message = req.body.toString('utf8');
  console.log(`Received job with payload: ${message}`);
  res.send(`Printed job with payload: ${message}`).end();
});
// [END cloud_scheduler_app]

app.get('/', (req, res) => {
  res.status(200).send('Hello, World!').end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
