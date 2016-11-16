/**
 * Copyright 2016, Google, Inc.
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

// [START functions_helloworld_debug]
require('@google/cloud-debug').start();
// [END functions_helloworld_debug]

// [START functions_helloworld]
/**
 * Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloWorld = function helloWorld (event, callback) {
  console.log(`My Cloud Function: ${event.data.message}`);
  callback();
};
// [END functions_helloworld]

// [START functions_helloworld_get]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloGET = function helloGET (req, res) {
  res.send('Hello World!');
};
// [END functions_helloworld_get]

// [START functions_helloworld_http]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloHttp = function helloHttp (req, res) {
  res.send(`Hello ${req.body.name || 'World'}!`);
};
// [END functions_helloworld_http]

// [START functions_helloworld_background]
/**
 * Background Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloBackground = function helloBackground (event, callback) {
  callback(null, `Hello ${event.data.name || 'World'}!`);
};
// [END functions_helloworld_background]

// [START functions_helloworld_pubsub]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloPubSub = function helloPubSub (event, callback) {
  const pubsubMessage = event.data;
  const name = pubsubMessage.data ? Buffer.from(pubsubMessage.data, 'base64').toString() : 'World';
  console.log(`Hello ${name}!`);
  callback();
};
// [END functions_helloworld_pubsub]

// [START functions_helloworld_storage]
/**
 * Background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloGCS = function helloGCS (event, callback) {
  const file = event.data;
  const isDelete = file.resourceState === 'not_exists';

  if (isDelete) {
    console.log(`File ${file.name} deleted.`);
  } else {
    console.log(`File ${file.name} uploaded.`);
  }

  callback();
};
// [END functions_helloworld_storage]

// [START functions_helloworld_error]
/**
 * Background Cloud Function that throws an error.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloError = function helloError (event, callback) {
  // This WILL be reported to Stackdriver errors
  throw new Error('I failed you');
};
// [END functions_helloworld_error]

/* eslint-disable */
// [START functions_helloworld_error_2]
/**
 * Background Cloud Function that throws a value.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloError2 = function helloError2 (event, callback) {
  // This will NOT be reported to Stackdriver errors
  throw 1;
};
// [END functions_helloworld_error_2]
/* eslint-enable */

// [START functions_helloworld_error_3]
/**
 * Background Cloud Function that throws an error.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloError3 = function helloError3 (event, callback) {
  // This will NOT be reported to Stackdriver errors
  callback('I failed you');
};
// [END functions_helloworld_error_3]
