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

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {OAuth2Client} = require('google-auth-library');
const path = require('path');
const {Buffer} = require('safe-buffer');
const process = require('process'); // Required for mocking environment variables

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const {PubSub} = require('@google-cloud/pubsub');

// Instantiate a pubsub client
const authClient = new OAuth2Client();
const pubsub = new PubSub();

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const formBodyParser = bodyParser.urlencoded({extended: false});
const jsonBodyParser = bodyParser.json();

// List of all messages received by this instance
const messages = [];
const claims = [];
const tokens = [];

// The following environment variables are set by app.yaml when running on GAE,
// but will need to be manually set when running locally.
const {PUBSUB_VERIFICATION_TOKEN} = process.env;
const TOPIC = process.env.PUBSUB_TOPIC;

const topic = pubsub.topic(TOPIC);

// [START gae_flex_pubsub_index]
app.get('/', (req, res) => {
  res.render('index', {messages, tokens, claims});
});

app.post('/', formBodyParser, async (req, res, next) => {
  if (!req.body.payload) {
    res.status(400).send('Missing payload');
    return;
  }

  const data = Buffer.from(req.body.payload);
  try {
    const messageId = await topic.publish(data);
    res.status(200).send(`Message ${messageId} sent.`);
  } catch (error) {
    next(error);
  }
});
// [END gae_flex_pubsub_index]

// [START gae_flex_pubsub_push]
app.post('/pubsub/push', jsonBodyParser, (req, res) => {
  if (req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
    res.status(400).send();
    return;
  }

  // The message is a unicode string encoded in base64.
  const message = Buffer.from(req.body.message.data, 'base64').toString(
    'utf-8'
  );

  messages.push(message);

  res.status(200).send();
});
// [END gae_flex_pubsub_push]

// [START gae_flex_pubsub_auth_push]
app.post('/pubsub/authenticated-push', jsonBodyParser, async (req, res) => {
  // Verify that the request originates from the application.
  if (req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
    res.status(400).send('Invalid request');
    return;
  }

  // Verify that the push request originates from Cloud Pub/Sub.
  try {
    // Get the Cloud Pub/Sub-generated JWT in the "Authorization" header.
    const bearer = req.header('Authorization');
    const token = bearer.match(/Bearer (.*)/)[1];
    tokens.push(token);

    // Verify and decode the JWT.
    const ticket = await authClient.verifyIdToken({
      idToken: token,
      audience: 'example.com',
    });

    const claim = ticket.getPayload();
    claims.push(claim);
  } catch (e) {
    res.status(400).send('Invalid token');
    return;
  }

  // The message is a unicode string encoded in base64.
  const message = Buffer.from(req.body.message.data, 'base64').toString(
    'utf-8'
  );

  messages.push(message);

  res.status(200).send();
});
// [END gae_flex_pubsub_auth_push]

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
