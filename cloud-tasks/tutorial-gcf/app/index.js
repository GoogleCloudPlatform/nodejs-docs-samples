// Copyright 2019 Google LLC
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

const createHttpTaskWithToken = require('./createTask');
const express = require('express');

const app = express();

const {QUEUE_NAME} = process.env;
const {QUEUE_LOCATION} = process.env;
const {FUNCTION_URL} = process.env;
const {SERVICE_ACCOUNT_EMAIL} = process.env;

// Parse form inputs from /index.html.
app.use(express.urlencoded({extended: true}));

// [START cloud_tasks_app]
app.post('/send-email', (req, res) => {
  // Set the task payload to the form submission.
  const {to_name, from_name, to_email, date} = req.body;
  const payload = {to_name, from_name, to_email};

  createHttpTaskWithToken(
    process.env.GOOGLE_CLOUD_PROJECT,
    QUEUE_NAME,
    QUEUE_LOCATION,
    FUNCTION_URL,
    SERVICE_ACCOUNT_EMAIL,
    payload,
    date
  );

  res.status(202).send('📫 Your postcard is in the mail! 💌');
});
// [END cloud_tasks_app]

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
