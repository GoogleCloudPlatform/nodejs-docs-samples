// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START run_events_pubsub_handler]
const express = require('express');
const app = express();

app.use(express.json());
app.post('/', (req, res) => {
  if (!req.body) {
    const msg = 'no Pub/Sub message received';
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  if (!req.body.message) {
    const msg = 'invalid Pub/Sub message format';
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  const pubSubMessage = req.body.message;
  const name = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : 'World';
  
  const msg = `Hello, ${name}! ID: ${req.get('ce-id') || ''}`;
  console.log(msg);
  res.send(msg);
});

module.exports = app;
// [END run_events_pubsub_handler]
