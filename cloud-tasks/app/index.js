/**
 * Copyright 2019 Google LLC
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

const createHttpTaskWithToken = require('./createTask');
const express = require('express');

const app = express();

const QUEUE_NAME = process.env.QUEUE_NAME || 'my-queue';
const QUEUE_LOCATION = process.env.QUEUE_LOCATION || 'us-central1';
const FUNCTION_URL = process.env.FUNCTION_URL ||
    'https://<region>-<project_id>.cloudfunctions.net/sendPostcard';
const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL ||
    '<member>@<project_id>.iam.gserviceaccount.com';

app.use(express.urlencoded());

app.post('/send-email', (req, res) => {
  // Construct Task payload
  const payload = {
    to_email: req.body.to_email,
    from_email: req.body.from_email,
    message: req.body.message
  }

  createHttpTaskWithToken(
    process.env.GOOGLE_CLOUD_PROJECT,
    QUEUE_NAME,
    QUEUE_LOCATION,
    FUNCTION_URL,
    SERVICE_ACCOUNT_EMAIL,
    payload,
    req.body.date
  );

  res.status(202).send('📫 Your postcard is in the mail! 💌');
})

app.get('*', (req, res) => {
  res.send('OK').end();
});

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
