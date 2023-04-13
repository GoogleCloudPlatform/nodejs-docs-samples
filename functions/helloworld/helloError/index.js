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

const functions = require('@google-cloud/functions-framework');

/* eslint-disable no-unused-vars */

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
  // [START functions_helloworld_error_2]
  // These WILL be reported to Error Reporting
  console.error(new Error('I failed you')); // Logging an Error object
  console.error('I failed you'); // Logging something other than an Error object
  throw 1; // Throwing something other than an Error object
  // [END functions_helloworld_error_2]
};

/**
 * Background Cloud Function that returns an error.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} context The event metadata.
 * @param {function} callback The callback function.
 */
exports.helloError3 = (event, context, callback) => {
  // [START functions_helloworld_error_3]
  // This will NOT be reported to Error Reporting
  callback('I failed you');
  // [END functions_helloworld_error_3]
};

// HTTP Cloud Function that returns an error.
functions.http('helloError4', (req, res) => {
  // [START functions_helloworld_error_4]
  // This will NOT be reported to Error Reporting
  res.status(500).send('I failed you');
  // [END functions_helloworld_error_4]
});
