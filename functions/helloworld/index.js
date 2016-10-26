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

// [START helloworld]
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
// [END helloworld]

// [START helloGET]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloGET = function helloGET (req, res) {
  res.send('Hello World!');
};
// [END helloGET]

// [START helloHttp]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloHttp = function helloHttp (req, res) {
  res.send(`Hello ${req.body.name || 'World'}!`);
};
// [END helloHttp]

// [START helloBackground]
/**
 * Background Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloBackground = function helloBackground (event, callback) {
  callback(null, `Hello ${event.data.name || 'World'}!`);
};
// [END helloBackground]

// [START helloPubSub]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloPubSub = function helloPubSub (event, callback) {
  const pubsubMessage = event.data;
  const name = pubsubMessage.data ? Buffer.from(pubsubMessage.data, 'base64') : 'World';
  console.log(`Hello ${name}!`);
  callback();
};
// [END helloPubSub]

// [START helloGCS]
/**
 * Background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.helloGCS = function helloGCS (event, callback) {
  console.log(`Hello ${event.data.name || 'World'}!`);
  callback();
};
// [END helloGCS]
