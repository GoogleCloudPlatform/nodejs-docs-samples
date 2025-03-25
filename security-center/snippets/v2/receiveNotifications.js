/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(
  projectId = 'your-project-id',
  subscriptionId = 'your-subscription-id'
) {
  // [START securitycenter_receive_notifications]
  const {PubSub} = require('@google-cloud/pubsub');
  const {StringDecoder} = require('string_decoder');

  // projectId = 'your-project-id'
  // subscriptionId = 'your-subscription-id'

  const subscriptionName =
    'projects/' + projectId + '/subscriptions/' + subscriptionId;
  const pubSubClient = new PubSub();

  function listenForMessages() {
    const subscription = pubSubClient.subscription(subscriptionName);

    // message.data is a buffer array of json
    // 1. Convert buffer to normal string
    // 2. Convert json to NotificationMessage object
    const messageHandler = message => {
      const jsonString = new StringDecoder('utf-8').write(message.data);
      const parsedNotificationMessage = JSON.parse(jsonString);

      console.log(parsedNotificationMessage);
      console.log(parsedNotificationMessage.finding);

      // ACK when done with message
      message.ack();
    };

    subscription.on('message', messageHandler);

    // Set timeout to 10 seconds
    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
    }, 10000);
  }

  await listenForMessages();
  // [END securitycenter_receive_notifications]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
