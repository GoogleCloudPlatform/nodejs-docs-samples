// Copyright 2023 Google LLC
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

// [START functions_cloudevent_tips_retry]
const functions = require('@google-cloud/functions-framework');

/**
 * Register a Cloud Event Function that demonstrates
 * how to toggle retries using a promise
 *
 * @param {object} event The Cloud Event for the function trigger.
 */
functions.cloudEvent('retryPromise', cloudEvent => {
  // The Pub/Sub event payload is passed as the CloudEvent's data payload.
  // See the documentation for more details:
  // https://cloud.google.com/eventarc/docs/cloudevents#pubsub
  const base64PubsubMessage = cloudEvent.data.message.data;
  const jsonString = Buffer.from(base64PubsubMessage, 'base64').toString();

  const tryAgain = JSON.parse(jsonString).retry;

  if (tryAgain) {
    throw new Error('Retrying...');
  } else {
    console.error('Not retrying...');
    return Promise.resolve();
  }
});

/**
 * Cloud Event Function that demonstrates
 * how to toggle retries using a callback
 *
 * @param {object} event The Cloud Event for the function trigger.
 * @param {function} callback The callback function.
 */
functions.cloudEvent('retryCallback', (cloudEvent, callback) => {
  // The Pub/Sub event payload is passed as the CloudEvent's data payload.
  // See the documentation for more details:
  // https://cloud.google.com/eventarc/docs/cloudevents#pubsub
  const base64PubsubMessage = cloudEvent.data.message.data;
  const jsonString = Buffer.from(base64PubsubMessage, 'base64').toString();

  const tryAgain = JSON.parse(jsonString).retry;
  const err = new Error('Error!');

  if (tryAgain) {
    console.error('Retrying:', err);
    callback(err);
  } else {
    console.error('Not retrying:', err);
    callback();
  }
});
// [END functions_cloudevent_tips_retry]
