// Copyright 2018 Google LLC
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

// [START functions_tips_connection_pooling]
const fetch = require('node-fetch');

const http = require('http');
const https = require('https');

const functions = require('@google-cloud/functions-framework');

const httpAgent = new http.Agent({keepAlive: true});
const httpsAgent = new https.Agent({keepAlive: true});

/**
 * HTTP Cloud Function that caches an HTTP agent to pool HTTP connections.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('connectionPooling', async (req, res) => {
  try {
    // TODO(optional): replace this with your own URL.
    const url = 'https://www.example.com/';

    // Select the appropriate agent to use based on the URL.
    const agent = url.includes('https') ? httpsAgent : httpAgent;

    const fetchResponse = await fetch(url, {agent});
    const text = await fetchResponse.text();

    res.status(200).send(`Data: ${text}`);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});
// [END functions_tips_connection_pooling]
