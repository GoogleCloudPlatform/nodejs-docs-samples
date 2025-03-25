/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START cloudrun_imageproc_controller]

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
// [END cloudrun_imageproc_controller]

module.exports = app;
