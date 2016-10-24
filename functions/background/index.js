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
 * Background Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.payload The event payload.
 * @param {function} The callback function.
 */
exports.helloWorld = function helloWorld (event, callback) {
  if (!event.payload.myMessage) {
    // This is an error case, "myMessage" is required
    callback(new Error('No message defined!'));
  } else {
    // Everything is ok
    console.log(event.payload.myMessage);
    callback();
  }
};
// [END helloworld]

// [START helloPromise]
/**
 * Background Cloud Function that returns a Promise. Note that we don't pass
 * a "context" argument to the function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.payload The event payload.
 * @returns {Promise}
 */
exports.helloPromise = function helloPromise (event) {
  const request = require('request-promise');

  return request({
    uri: event.payload.endpoint
  });
};
// [END helloPromise]

// [START helloSynchronous]
/**
 * Background Cloud Function that returns synchronously. Note that we don't pass
 * a "context" argument to the function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.payload The event payload.
 */
exports.helloSynchronous = function helloSynchronous (event) {
  // This function returns synchronously
  if (event.payload.something === true) {
    return 'Something is true!';
  } else {
    throw new Error('Something was not true!');
  }
};
// [END helloSynchronous]
