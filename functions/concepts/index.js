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

/**
 * HTTP Cloud Function that demonstrates
 * how to catch errors of different types.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.errorTypes = (req, res) => {
  // [START functions_concepts_error_object]
  try {
    // Throw an Error object (to simulate a GCP API failure)
    throw new Error('Error object!');
  } catch (err) {
    // err is already an Error object
    console.error(err);
  }
  // [END functions_concepts_error_object]

  /* eslint-disable no-throw-literal */
  // [START functions_concepts_error_unknown]
  try {
    // Throw an unknown error type
    if (Date.now() % 2 === 0) {
      throw 'Error string!';
    } else {
      throw new Error('Error object!');
    }
  } catch (err) {
    // Determine the error type
    if (err instanceof Error) {
      console.error(err);
    } else {
      console.error(new Error(err));
    }
  }
  // [END functions_concepts_error_unknown]
  /* eslint-enable no-throw-literal */

  res.end();
};

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

// [START functions_after_response]
exports.afterResponse = (req, res) => {
  res.end();

  // This statement may not execute
  console.log('Function complete!');
};
// [END functions_after_response]

// [START functions_after_timeout]
exports.afterTimeout = (req, res) => {
  setTimeout(() => {
    // May not execute if function's timeout is <2 minutes
    console.log('Function running...');
    res.end();
  }, 120000); // 2 minute delay
};
// [END functions_after_timeout]
