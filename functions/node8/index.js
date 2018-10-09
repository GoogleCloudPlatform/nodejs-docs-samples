/**
 * Copyright 2018, Google LLC.
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

// [START functions_tips_infinite_retries_node8]
/**
 * Background Cloud Function that only executes within a certain time
 * period after the triggering event to avoid infinite retry loops.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.avoidInfiniteRetries = (data, context) => {
  const eventAge = Date.now() - Date.parse(context.timestamp);
  const eventMaxAge = 10000;

  // Ignore events that are too old
  if (eventAge > eventMaxAge) {
    console.log(`Dropping event ${context.eventId} with age ${eventAge} ms.`);
    return;
  }

  // Do what the function is supposed to do
  console.log(`Processing event ${context.eventId} with age ${eventAge} ms.`);
};
// [END functions_tips_infinite_retries_node8]

// [START functions_tips_retry_node8]
/**
 * Background Cloud Function that demonstrates
 * how to toggle retries using a promise
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.retryPromise = (data, context) => {
  const tryAgain = !!data.retry;

  if (tryAgain) {
    throw new Error(`Retrying...`);
  } else {
    return new Error('Not retrying...');
  }
};
// [END functions_tips_retry_node8]

// [START functions_helloworld_background_node8]
/**
 * Background Cloud Function.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.helloBackground = (data, context) => {
  return `Hello ${data.name || 'World'}!`;
};
// [END functions_helloworld_background_node8]

// [START functions_helloworld_pubsub_node8]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.helloPubSub = (data, context) => {
  const pubSubMessage = data;
  const name = pubSubMessage.data ? Buffer.from(pubSubMessage.data, 'base64').toString() : 'World';

  console.log(`Hello, ${name}!`);
};
// [END functions_helloworld_pubsub_node8]

// [START functions_helloworld_storage_node8]
/**
 * Background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.helloGCS = (data, context) => {
  const file = data;
  if (file.resourceState === 'not_exists') {
    console.log(`File ${file.name} deleted.`);
  } else if (file.metageneration === '1') {
    // metageneration attribute is updated on metadata changes.
    // on create value is 1
    console.log(`File ${file.name} uploaded.`);
  } else {
    console.log(`File ${file.name} metadata updated.`);
  }
};
// [END functions_helloworld_storage_node8]

// [START functions_helloworld_storage_generic_node8]
/**
 * Generic background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.helloGCSGeneric = (data, context) => {
  const file = data;
  console.log(`  Event ${context.eventId}`);
  console.log(`  Event Type: ${context.eventType}`);
  console.log(`  Bucket: ${file.bucket}`);
  console.log(`  File: ${file.name}`);
  console.log(`  Metageneration: ${file.metageneration}`);
  console.log(`  Created: ${file.timeCreated}`);
  console.log(`  Updated: ${file.updated}`);
};
// [END functions_helloworld_storage_generic_node8]

// [START functions_firebase_rtdb_node8]
/**
 * Triggered by a change to a Firebase RTDB reference.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.helloRTDB = (data, context) => {
  const triggerResource = context.resource;

  console.log(`Function triggered by change to: ${triggerResource}`);
  console.log(`Admin?: ${!!data.admin}`);
  console.log(`Delta:`);
  console.log(JSON.stringify(data.delta, null, 2));
};
// [END functions_firebase_rtdb_node8]

// [START functions_firebase_firestore_node8]
/**
 * Triggered by a change to a Firestore document.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.helloFirestore = (data, context) => {
  const triggerResource = context.resource;

  console.log(`Function triggered by change to: ${triggerResource}`);
  console.log(`Event type: ${context.eventType}`);

  if (data.oldValue && Object.keys(data.oldValue).length) {
    console.log(`\nOld value:`);
    console.log(JSON.stringify(data.oldValue, null, 2));
  }

  if (data.value && Object.keys(data.value).length) {
    console.log(`\nNew value:`);
    console.log(JSON.stringify(data.value, null, 2));
  }
};
// [END functions_firebase_firestore_node8]

// [START functions_firebase_auth_node8]
/**
 * Triggered by creation or deletion of a Firebase Auth user object.
 *
 * @param {object} data The event payload.
 * @param {object} context The event metadata.
 */
exports.helloAuth = (data, context) => {
  try {
    console.log(`Function triggered by creation or deletion of user: ${data.uid}`);
    console.log(`Created at: ${data.metadata.createdAt}`);

    if (data.email) {
      console.log(`Email: ${data.email}`);
    }
  } catch (err) {
    console.error(err);
  }
};
// [END functions_firebase_auth_node8]
