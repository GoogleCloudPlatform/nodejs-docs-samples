// Copyright 2020 Google, LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START eventarc_pubsub_handler]
const express = require('express');
const {
  toMessagePublishedData,
} = require('@google/events/cloud/pubsub/v1/MessagePublishedData');
const app = express();

app.use(express.json());
app.post('/', (req, res) => {
  if (!req.body) {
    const errorMessage = 'no Pub/Sub message received';
    res.status(400).send(`Bad Request: ${errorMessage}`);
    console.log(`Bad Request: ${errorMessage}`);
    return;
  }
  if (!req.body.message) {
    const errorMessage = 'invalid Pub/Sub message format';
    res.status(400).send(`Bad Request: ${errorMessage}`);
    console.log(`Bad Request: ${errorMessage}`);
    return;
  }
  // Cast to MessagePublishedEvent for IDE autocompletion
  const pubSubMessage = toMessagePublishedData(req.body);
  const name =
    pubSubMessage.message && pubSubMessage.message.data
      ? Buffer.from(pubSubMessage.message.data, 'base64').toString().trim()
      : 'World';

  const result = `Hello, ${name}! ID: ${req.get('ce-id') || ''}`;
  console.log(result);
  res.send(result);
});

module.exports = app;
// [END eventarc_pubsub_handler]
