// Copyright 2022 Google LLC
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

// [START functions_concepts_requests]
const fetch = require('node-fetch');
const functions = require('@google-cloud/functions-framework');

/**
 * HTTP Cloud Function that makes an HTTP request
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('makeRequest', async (req, res) => {
  const url = 'https://example.com'; // URL to send the request to
  const externalRes = await fetch(url);
  res.sendStatus(externalRes.ok ? 200 : 500);
});
// [END functions_concepts_requests]
