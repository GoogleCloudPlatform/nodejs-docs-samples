// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START run_events_pubsub_handler]
const express = require('express');
const {toMessagePublishedEvent} = require('@google/events/cloud/pubsub/v1/MessagePublishedData');
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
  const pubSubMessage = toMessagePublishedEvent(req.body);
  const name = pubSubMessage.message && pubSubMessage.message.data
    ? Buffer.from(pubSubMessage.message.data, 'base64').toString().trim()
    : 'World';
  
  const result = `Hello, ${name}! ID: ${req.get('ce-id') || ''}`;
  console.log(result);
  res.send(result);
});

module.exports = app;
// [END run_events_pubsub_handler]
