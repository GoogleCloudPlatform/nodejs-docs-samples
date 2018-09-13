/**
 * Copyright 2018, Google, Inc.
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

// [START cloud_tasks_appengine_quickstart]
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
app.enable('trust proxy');

app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/', (req, res) => {
  // Basic index to verify app is serving
  res.send('Hello, World!').end();
});

app.post('/log_payload', (req, res) => {
  // Log the request payload
  console.log('Received task with payload: %s', req.body);
  res.send(`Printed task payload: ${req.body}`).end();
});

app.get('*', (req, res) => {
  res.send('OK').end();
});

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END cloud_tasks_appengine_quickstart]
