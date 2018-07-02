/**
 * Background Cloud Function that only executes within
 * a certain time period after the triggering event
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */

// [START functions_tips_infinite_retries_node8]
/**
 * Background Cloud Function that only executes within
 * a certain time period after the triggering event
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} context Information about the event.
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
 * Background Cloud Function that only executes within
 * a certain time period after the triggering event
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} context Information about the event.
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

// helloBackground
// helloPubSub
// helloGCS
// helloGCSGeneric

// [START functions_helloworld_background]
/**
 * Background Cloud Function.
 *
 * @param {object} event Data passed to the Cloud Function.
 */
exports.helloBackground = (data) => {
  return `Hello ${data.name || 'World'}!`;
};
// [END functions_helloworld_background]

// [START functions_helloworld_pubsub]
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} event The Cloud Functions event.
 */
exports.helloPubSub = (event) => {
  const pubsubMessage = event.data;
  const name = pubsubMessage.data ? Buffer.from(pubsubMessage.data, 'base64').toString() : 'World';

  console.log(`Hello, ${name}!`);
};
// [END functions_helloworld_pubsub]

// [START functions_helloworld_storage]
/**
 * Background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} file The Cloud Functions event.
 */
exports.helloGCS = (file) => {
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
// [END functions_helloworld_storage]

// [START functions_helloworld_storage_generic]
/**
 * Generic background Cloud Function to be triggered by Cloud Storage.
 *
 * @param {object} event The Cloud Functions event.
 */
exports.helloGCSGeneric = (file, context) => {
  console.log(`  Event ${context.eventId}`);
  console.log(`  Event Type: ${context.eventType}`);
  console.log(`  Bucket: ${file.bucket}`);
  console.log(`  File: ${file.name}`);
  console.log(`  Metageneration: ${file.metageneration}`);
  console.log(`  Created: ${file.timeCreated}`);
  console.log(`  Updated: ${file.updated}`);
};
// [END functions_helloworld_storage_generic]
