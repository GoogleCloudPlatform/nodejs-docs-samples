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

// [START functions_concepts_stateless]
// Global variable, but only shared within function instance.
let count = 0;

/**
 * HTTP Cloud Function that counts how many times
 * it is executed within a specific instance.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.executionCount = (req, res) => {
  count++;

  // Note: the total function invocation count across
  // all instances may not be equal to this value!
  res.send(`Instance execution count: ${count}`);
};
// [END functions_concepts_stateless]

// [START functions_concepts_after_response]
/**
 * HTTP Cloud Function that may not completely
 * execute due to early HTTP response
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.afterResponse = (req, res) => {
  res.end();

  // This statement may not execute
  console.log('Function complete!');
};
// [END functions_concepts_after_response]

// [START functions_concepts_after_timeout]
/**
 * HTTP Cloud Function that may not completely
 * execute due to function execution timeout
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.afterTimeout = (req, res) => {
  setTimeout(() => {
    // May not execute if function's timeout is <2 minutes
    console.log('Function running...');
    res.end();
  }, 120000); // 2 minute delay
};
// [END functions_concepts_after_timeout]

// [START functions_concepts_filesystem]
const fs = require('fs');

/**
 * HTTP Cloud Function that lists files in the function directory
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.listFiles = (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      console.log('Files', files);
      res.sendStatus(200);
    }
  });
};
// [END functions_concepts_filesystem]

// [START functions_concepts_requests]
const fetch = require('node-fetch');

/**
 * HTTP Cloud Function that makes an HTTP request
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.makeRequest = async (req, res) => {
  const url = 'https://example.com'; // URL to send the request to
  const externalRes = await fetch(url);
  res.sendStatus(externalRes.ok ? 200 : 500);
};
// [END functions_concepts_requests]
