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

// [START functions_tips_retry]
/**
 * Background Cloud Function that demonstrates
 * how to toggle retries using a promise
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.data Data included with the event.
 * @param {object} event.data.retry User-supplied parameter that tells the function whether to retry.
 */
exports.retryPromise = event => {
  const tryAgain = !!event.data.retry;

  if (tryAgain) {
    throw new Error('Retrying...');
  } else {
    console.error('Not retrying...');
    return Promise.resolve();
  }
};

/**
 * Background Cloud Function that demonstrates
 * how to toggle retries using a callback
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.data Data included with the event.
 * @param {object} event.data.retry User-supplied parameter that tells the function whether to retry.
 * @param {function} callback The callback function.
 */
exports.retryCallback = (event, callback) => {
  const tryAgain = !!event.data.retry;
  const err = new Error('Error!');

  if (tryAgain) {
    console.error('Retrying:', err);
    callback(err);
  } else {
    console.error('Not retrying:', err);
    callback();
  }
};
// [END functions_tips_retry]
