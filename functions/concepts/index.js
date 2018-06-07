/**
 * Copyright 2018, Google, Inc.
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
 * @param {Object} req.body Cloud Function request context body.
 * @param {String} req.body.topic The Cloud Pub/Sub topic to publish to.
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

  const someCondition = !!req.body.throwAsString;

  /* eslint-disable no-throw-literal */
  // [START functions_concepts_error_unknown]
  try {
    // Throw an unknown error type
    if (someCondition) {
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

// [START functions_concepts_modules]
const path = require('path');
const loadedModule = require(path.join(__dirname, 'loadable.js'));

/**
 * HTTP Cloud Function that runs a function loaded from another Node.js file
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.runLoadedModule = (req, res) => {
  console.log(`Loaded function from file ${loadedModule.getFileName()}`);
  res.end();
};
// [END functions_concepts_modules]

// [START functions_concepts_requests]
const request = require('request');

/**
 * HTTP Cloud Function that makes an HTTP request
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.makeRequest = (req, res) => {
  // The URL to send the request to
  const url = 'https://example.com';

  request(url, (err, response) => {
    if (!err && response.statusCode === 200) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  });
};
// [END functions_concepts_requests]
