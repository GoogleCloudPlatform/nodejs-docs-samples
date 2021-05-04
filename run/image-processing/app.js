// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START cloudrun_imageproc_controller]
// [START run_imageproc_controller]

const express = require('express');
const app = express();

// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

const image = require('./image');

app.post('/', async (req, res) => {
  if (!req.body) {
    const msg = 'no Pub/Sub message received';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  if (!req.body.message || !req.body.message.data) {
    const msg = 'invalid Pub/Sub message format';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  // Decode the Pub/Sub message.
  const pubSubMessage = req.body.message;
  let data;
  try {
    data = Buffer.from(pubSubMessage.data, 'base64').toString().trim();
    data = JSON.parse(data);
  } catch (err) {
    const msg =
      'Invalid Pub/Sub message: data property is not valid base64 encoded JSON';
    console.error(`error: ${msg}: ${err}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  // Validate the message is a Cloud Storage event.
  if (!data.name || !data.bucket) {
    const msg =
      'invalid Cloud Storage notification: expected name and bucket properties';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  try {
    await image.blurOffensiveImages(data);
    res.status(204).send();
  } catch (err) {
    console.error(`error: Blurring image: ${err}`);
    res.status(500).send();
  }
});
// [END run_imageproc_controller]
// [END cloudrun_imageproc_controller]

module.exports = app;
