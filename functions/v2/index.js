// Copyright 2021 Google LLC
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

// [START functions_cloudevent_pubsub]
/**
 * CloudEvent function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} cloudevent A CloudEvent containing the Pub/Sub message.
 * @param {object} cloudevent.data.message The Pub/Sub message itself.
 */
exports.helloPubSub = cloudevent => {
  const base64name = cloudevent.data.message.data;

  const name = base64name
    ? Buffer.from(base64name, 'base64').toString()
    : 'World';

  console.log(`Hello, ${name}!`);
};
// [END functions_cloudevent_pubsub]

// [START functions_cloudevent_storage]
/**
 * CloudEvent function to be triggered by Cloud Storage.
 *
 * @param {object} cloudevent A CloudEvent containing the Cloud Storage event.
 * @param {object} cloudevent.data The Cloud Storage event itself.
 */
exports.helloGCS = cloudevent => {
  console.log(`Event ID: ${cloudevent.id}`);
  console.log(`Event Type: ${cloudevent.type}`);

  const file = cloudevent.data;
  console.log(`Bucket: ${file.bucket}`);
  console.log(`File: ${file.name}`);
  console.log(`Metageneration: ${file.metageneration}`);
  console.log(`Created: ${file.timeCreated}`);
  console.log(`Updated: ${file.updated}`);
};
// [END functions_cloudevent_storage]
