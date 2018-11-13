/**
 * Copyright 2017, Google, Inc.
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

// [START gae_flex_metadata]
const express = require('express');
const request = require('got');

const app = express();
app.enable('trust proxy');

const METADATA_NETWORK_INTERFACE_URL =
  'http://metadata/computeMetadata/v1/' +
  '/instance/network-interfaces/0/access-configs/0/external-ip';

function getExternalIp() {
  const options = {
    headers: {
      'Metadata-Flavor': 'Google',
    },
    json: true,
  };

  return request(METADATA_NETWORK_INTERFACE_URL, options)
    .then(response => response.body)
    .catch(err => {
      if (err || err.statusCode !== 200) {
        console.log(
          'Error while talking to metadata server, assuming localhost'
        );
        return 'localhost';
      }
      return Promise.reject(err);
    });
}

app.get('/', (req, res, next) => {
  getExternalIp()
    .then(externalIp => {
      res
        .status(200)
        .send(`External IP: ${externalIp}`)
        .end();
    })
    .catch(next);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_flex_metadata]
