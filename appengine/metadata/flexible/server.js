// Copyright 2017 Google LLC
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

// [START gae_flex_metadata]
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.enable('trust proxy');

const METADATA_NETWORK_INTERFACE_URL =
  'http://metadata/computeMetadata/v1/' +
  '/instance/network-interfaces/0/access-configs/0/external-ip';

const getExternalIp = async () => {
  const options = {
    headers: {
      'Metadata-Flavor': 'Google',
    },
    json: true,
  };

  try {
    const response = await fetch(METADATA_NETWORK_INTERFACE_URL, options);
    const ip = await response.json();
    return ip;
  } catch (err) {
    console.log('Error while talking to metadata server, assuming localhost');
    return 'localhost';
  }
};

app.get('/', async (req, res, next) => {
  try {
    const externalIp = await getExternalIp();
    res.status(200).send(`External IP: ${externalIp}`).end();
  } catch (err) {
    next(err);
  }
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_flex_metadata]
module.exports = app;
