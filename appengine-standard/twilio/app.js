/**
 * Copyright 2016, Google, Inc.
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

// [START app]
'use strict';

const format = require('util').format;
const express = require('express');
const bodyParser = require('body-parser').urlencoded({
  extended: false
});

const app = express();

// [START config]
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
if (!TWILIO_NUMBER) {
  console.log('Please configure environment variables as described in README.md');
  process.exit(1);
}

const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TwimlResponse = require('twilio').TwimlResponse;
// [END config]

// [START receive_call]
app.post('/call/receive', (req, res) => {
  const resp = new TwimlResponse();
  resp.say('Hello from Google App Engine.');

  res.status(200)
    .contentType('text/xml')
    .send(resp.toString());
});
// [END receive_call]

// [START send_sms]
app.get('/sms/send', (req, res, next) => {
  const to = req.query.to;
  if (!to) {
    res.status(400).send('Please provide an number in the "to" query string parameter.');
    return;
  }

  twilio.sendMessage({
    to: to,
    from: TWILIO_NUMBER,
    body: 'Hello from Google App Engine'
  }, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.status(200).send('Message sent.');
  });
});
// [END send_sms]

// [START receive_sms]
app.post('/sms/receive', bodyParser, (req, res) => {
  const sender = req.body.From;
  const body = req.body.Body;

  const resp = new TwimlResponse();
  resp.message(format('Hello, %s, you said: %s', sender, body));

  res.status(200)
    .contentType('text/xml')
    .send(resp.toString());
});
// [END receive_sms]

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
