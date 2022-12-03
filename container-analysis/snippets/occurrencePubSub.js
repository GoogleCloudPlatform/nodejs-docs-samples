// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// sample-metadata:
//   title: Occurrence PubSub
//   description: Polls a specified PubSub subscription for Occurrences.  Requires a subscription to a topic named 'container-analysis-occurrences-v1'
//   usage: node occurrencePubSub.js "project-id" "subscription-id" "timeout-in-seconds"
async function main(
  projectId = 'your-project-id', // Your GCP Project ID
  subscriptionId = 'my-sub-id', // A user-specified subscription to the 'container-analysis-occurrences-v1' topic
  timeoutSeconds = 30 // The number of seconds to listen for the new Pub/Sub messages
) {
  // [START containeranalysis_pubsub]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   */
  // const projectId = 'your-project-id', // Your GCP Project ID
  // const subscriptionId = 'my-sub-id', // A user-specified subscription to the 'container-analysis-occurrences-v1' topic
  // const timeoutSeconds = 30 // The number of seconds to listen for the new Pub/Sub Messages

  // Import the pubsub library and create a client, topic and subscription
  const {PubSub} = require('@google-cloud/pubsub');
  const pubsub = new PubSub({projectId});
  const subscription = pubsub.subscription(subscriptionId);

  // Handle incoming Occurrences using a Cloud Pub/Sub subscription
  let count = 0;
  const messageHandler = message => {
    count++;
    message.ack();
  };

  // Listen for new messages until timeout is hit
  subscription.on('message', messageHandler);

  setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`Polled ${count} occurrences`);
  }, timeoutSeconds * 1000);
  // [END containeranalysis_pubsub]
}

main(...process.argv.slice(2));
