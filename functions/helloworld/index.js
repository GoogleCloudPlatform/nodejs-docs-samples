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

/* eslint-disable no-unused-vars */

// [START functions_helloworld_http]
// [START functions_helloworld_get]
const functions = require('@google-cloud/functions-framework');
// [END functions_helloworld_get]
const escapeHtml = require('escape-html');
// [END functions_helloworld_http]

// [START functions_helloworld_get]

// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
functions.http('helloGET', (req, res) => {
  res.send('Hello World!');
});
// [END functions_helloworld_get]

// [START functions_helloworld_http]

/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('helloHttp', (req, res) => {
  res.send(`Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);
});
// [END functions_helloworld_http]

// [START functions_helloworld_pubsub]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} message The Pub/Sub message.
 * @param {object} context The event metadata.
 */
exports.helloPubSub = (message, context) => {
  const name = message.data
    ? Buffer.from(message.data, 'base64').toString()
    : 'World';

  console.log(`Hello, ${name}!`);
};
// [END functions_helloworld_pubsub]

// [START functions_helloworld_storage]
/**
 * Generic background Cloud Function to be triggered by Cloud Storage.
 * This sample works for all Cloud Storage CRUD operations.
 *
 * @param {object} file The Cloud Storage file metadata.
 * @param {object} context The event metadata.
 */
exports.helloGCS = (file, context) => {
  console.log(`  Event: ${context.eventId}`);
  console.log(`  Event Type: ${context.eventType}`);
  console.log(`  Bucket: ${file.bucket}`);
  console.log(`  File: ${file.name}`);
  console.log(`  Metageneration: ${file.metageneration}`);
  console.log(`  Created: ${file.timeCreated}`);
  console.log(`  Updated: ${file.updated}`);
};
// [END functions_helloworld_storage]

/**
 * Background Cloud Function that throws an error.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} context The event metadata.
 * @param {function} callback The callback function.
 */

exports.helloError = (event, context, callback) => {
  // [START functions_helloworld_error]
  // These WILL be reported to Error Reporting
  throw new Error('I failed you'); // Will cause a cold start if not caught

  // [END functions_helloworld_error]
};

/**
 * Background Cloud Function that throws a value.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} context The event metadata.
 * @param {function} callback The callback function.
 */
exports.helloError2 = (event, context, callback) => {
  // [START functions_helloworld_error]
  // These will NOT be reported to Error Reporting
  console.error(new Error('I failed you')); // Logging an Error object
  console.error('I failed you'); // Logging something other than an Error object
  throw 1; // Throwing something other than an Error object
  // [END functions_helloworld_error]
};

/**
 * Background Cloud Function that returns an error.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} context The event metadata.
 * @param {function} callback The callback function.
 */
exports.helloError3 = (event, context, callback) => {
  // This will NOT be reported to Error Reporting
  // [START functions_helloworld_error]
  callback('I failed you');
  // [END functions_helloworld_error]
};

// HTTP Cloud Function that returns an error.
functions.http('helloError4', (req, res) => {
  // This will NOT be reported to Error Reporting
  // [START functions_helloworld_error]
  res.status(500).send('I failed you');
  // [END functions_helloworld_error]
});
