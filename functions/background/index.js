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

// [START functions_background_promise]
const requestPromiseNative = require('request-promise-native');

/**
 * Background Cloud Function that returns a Promise. Note that we don't pass
 * a "callback" argument to the function.
 *
 * @param {object} data The event data
 * @param {object} data.endpoint The URL to send the request to.
 * @returns {Promise}
 */
exports.helloPromise = data => {
  return requestPromiseNative({
    uri: data.endpoint,
  });
};
// [END functions_background_promise]

// [START functions_background_synchronous]
/**
 * Background Cloud Function that returns synchronously. Note that we don't pass
 * a "callback" argument to the function.
 *
 * @param {object} data The event data
 */
exports.helloSynchronous = data => {
  // This function returns synchronously
  if (data.something === true) {
    return 'Something is true!';
  } else {
    throw new Error('Something was not true!');
  }
};
// [END functions_background_synchronous]
