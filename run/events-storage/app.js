// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START run_events_storage_server_setup]
const express = require('express');
const app = express();
app.use(express.json());
// [END run_events_storage_server_setup]

// [START run_events_storage_handler]
app.post('/', (req, res) => {
  if (!req.body) {
    const msg = 'no message received';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  if (!req.body.message) {
    const msg = 'invalid Pub/Sub message format';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  console.log('--req.body');
  console.log(req.body);
  console.log('==req.body');
  
  res.status(204).send();
});

module.exports = app;
// [END run_events_storage_handler]
