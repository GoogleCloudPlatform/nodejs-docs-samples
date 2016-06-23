// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START helloworld]
/**
 * Cloud Function.
 *
 * @param {Object} context Cloud Function context.
 * @param {Object} data Request data, provided by a trigger.
 */
exports.helloWorld = function helloWorld (context, data) {
  console.log('My Cloud Function: ' + data.message);
  context.success();
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
  res.send('Hello ' + (req.body.name || 'World') + '!');
};
// [END helloHttp]

// [START helloBackground]
/**
 * Background Cloud Function.
 *
 * @param {Object} context Cloud Function context.
 * @param {Object} data Request data, provided by a trigger.
 */
exports.helloBackground = function helloBackground (context, data) {
  context.success('Hello ' + (data.name || 'World') + '!');
};
// [END helloBackground]

// [START helloPubSub]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {Object} context Cloud Function context.
 * @param {Object} data Request data, provided by a Pub/Sub trigger.
 */
exports.helloPubSub = function helloPubSub (context, data) {
  console.log('Hello ' + (data.name || 'World') + '!');
  context.success();
};
// [END helloPubSub]

// [START helloGCS]
/**
 * Background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {Object} context Cloud Function context.
 * @param {Object} data Request data, provided by a Cloud Storage trigger.
 */
exports.helloGCS = function helloGCS (context, data) {
  console.log('Hello ' + (data.name || 'World') + '!');
  context.success();
};
// [END helloGCS]
