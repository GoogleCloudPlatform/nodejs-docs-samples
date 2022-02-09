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

const express = require('express');
const bodyParser = express.urlencoded({
  extended: false,
});

const app = express();

const {TWILIO_NUMBER} = process.env;
if (!TWILIO_NUMBER) {
  console.log(
    'Please configure environment variables as described in README.md'
  );
  throw new Error(
    'Please configure environment variables as described in README.md'
  );
}

const twilio = require('twilio');

const twilioClient = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// [START gae_flex_twilio_receive_call]
app.post('/call/receive', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say('Hello from Google App Engine.');

  res.status(200).contentType('text/xml').send(twiml.toString());
});
// [END gae_flex_twilio_receive_call]

// [START gae_flex_twilio_send_sms]
app.get('/sms/send', async (req, res, next) => {
  const {to} = req.query;
  if (!to) {
    res
      .status(400)
      .send('Please provide an number in the "to" query string parameter.');
    return;
  }

  try {
    await twilioClient.messages.create({
      to: to,
      from: TWILIO_NUMBER,
      body: 'Hello from Google App Engine',
    });
    res.status(200).send('Message sent.');
  } catch (err) {
    next(err);
    return;
  }
});
// [END gae_flex_twilio_send_sms]

// [START gae_flex_twilio_receive_sms]
app.post('/sms/receive', bodyParser, (req, res) => {
  const sender = req.body.From;
  const body = req.body.Body;

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(`Hello, ${sender}, you said: ${body}`);

  res.status(200).contentType('text/xml').send(twiml.toString());
});
// [END gae_flex_twilio_receive_sms]

// Start the server
if (module === require.main) {
  const PORT = parseInt(process.env.PORT) || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}

exports.app = app;
