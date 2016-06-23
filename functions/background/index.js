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
 * Background Cloud Function.
 *
 * @param {Object} context Cloud Function context.
 * @param {Object} data Request data, provided by a trigger.
 * @param {string} data.message Message, provided by the trigger.
 */
exports.helloWorld = function helloWorld (context, data) {
  if (data.message === undefined) {
    // This is an error case, "message" is required
    context.failure('No message defined!');
  } else {
    // Everything is ok
    console.log(data.message);
    context.success();
  }
};
// [END helloworld]

// [START helloPromise]
var request = require('request-promise');

/**
 * Background Cloud Function that returns a Promise. Note that we don't pass
 * a "context" argument to the function.
 *
 * @param {Object} data Request data, provided by a trigger.
 * @returns {Promise}
 */
exports.helloPromise = function helloPromise (data) {
  return request({
    uri: data.endpoint
  });
};
// [END helloPromise]

// [START helloSynchronous]
/**
 * Background Cloud Function that returns synchronously. Note that we don't pass
 * a "context" argument to the function.
 *
 * @param {Object} data Request data, provided by a trigger.
 */
exports.helloSynchronous = function helloSynchronous (data) {
  // This function returns synchronously
  if (data.something === true) {
    return 'Something is true!';
  } else {
    throw new Error('Something was not true!');
  }
};
// [END helloSynchronous]
