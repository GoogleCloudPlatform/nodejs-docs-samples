/**
 * Copyright 2018, Google, Inc.
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

const httpShim = (PORT) => {
  // [START functions_testing_shim_http]
  // Import dependencies
  const gcfCode = require('./index.js');
  const express = require('express');

  // TODO(developer): specify the port to use
  // const PORT = 3000;

  // Start local HTTP server
  const app = express();
  const server = require(`http`).createServer(app);
  server.on('connection', socket => socket.unref());
  server.listen(PORT);

  // Register HTTP handlers
  Object.keys(gcfCode).forEach(gcfFn => {
    // Handle a single HTTP request
    const handler = (req, res) => {
      gcfCode[gcfFn](req, res);
      server.close();
    };

    app.get(`/${gcfFn}`, handler);
    app.post(`/${gcfFn}`, handler);
  });
  // [END functions_testing_shim_http]
};

const pubsubShim = (gcfFn, topicName, subscriptionName) => {
  // [START functions_testing_shim_pubsub]
  // Import dependencies
  const Pubsub = require('@google-cloud/pubsub');
  const pubsub = Pubsub();

  // TODO(developer): specify a function to test
  // const gcfCode = require('./index.js');
  // const gcfFn = gcfCode.YOUR_FUNCTION;

  // TODO(developer): specify an existing topic and subscription to use
  // const topicName = process.env.TOPIC || 'YOUR_TOPIC';
  // const subscriptionName = process.env.SUBSCRIPTION || 'YOUR_SUBSCRIPTION';

  // Subscribe to Pub/Sub topic
  const subscription = pubsub.topic(topicName).subscription(subscriptionName);

  // Handle a single Pub/Sub message
  const messageHandler = (msg) => {
    gcfFn({ data: msg }, () => {
      msg.ack();
      subscription.removeListener(`message`, messageHandler);
    });
  };
  subscription.on(`message`, messageHandler);
  // [END functions_testing_shim_pubsub]
};

const storageShim = (gcfFn, bucketName, topicName, subscriptionName) => {
  // [START functions_testing_shim_storage]
  // Import dependencies
  const Pubsub = require('@google-cloud/pubsub');
  const Storage = require(`@google-cloud/storage`);
  const pubsub = Pubsub();
  const storage = Storage();

  // TODO(developer): specify a function to test
  // const gcfCode = require('./index.js');
  // const gcfFn = gcfCode.YOUR_FUNCTION;

  // TODO(developer): specify a Cloud Storage bucket to monitor
  // const bucketName = 'YOUR_GCS_BUCKET'

  // TODO(developer): specify an existing topic and subscription to use
  // const topicName = process.env.TOPIC || 'YOUR_TOPIC';
  // const subscriptionName = process.env.SUBSCRIPTION || 'YOUR_SUBSCRIPTION';

  // Create notification on target bucket
  // Further info: https://cloud.google.com/storage/docs/reporting-changes
  const bucket = storage.bucket(bucketName);
  return bucket.createNotification(topicName)
    .then(data => data[0])
    .then((notification) => new Promise(resolve => {
      // Subscribe to Pub/Sub topic
      const subscription = pubsub
        .topic(topicName)
        .subscription(subscriptionName);

      // Handle a single Pub/Sub message
      const messageHandler = (msg) => {
        const data = JSON.parse(Buffer.from(msg.data, 'base64').toString());
        gcfFn({ data: data }, () => {
          msg.ack();
          subscription.removeListener(`message`, messageHandler);
          resolve(notification);
        });
      };
      subscription.on(`message`, messageHandler);
    }))
    .then(notification => notification.delete()); // Delete notification
  // [END functions_testing_shim_storage]
};

const gcfCodeGlobal = require('./index.js');
require(`yargs`) // eslint-disable-line
  .demandCommand(1)
  .command(
    'http <port>',
    'HTTP-triggered-function shim',
    {},
    opts => httpShim(opts.port)
  )
  .command(
    'pubsub <functionName> <topic> <subscription>',
    'PubSub-triggered-function shim',
    {},
    opts => pubsubShim(
      gcfCodeGlobal[opts.functionName],
      opts.topic,
      opts.subscription
    )
  )
  .command(
    'storage <functionName> <bucket> <topic> <subscription>',
    'Storage-triggered-function shim',
    {},
    opts => storageShim(
      gcfCodeGlobal[opts.functionName],
      opts.bucket,
      opts.topic,
      opts.subscription
    )
  )
  .wrap(120)
  .help()
  .strict()
  .argv;
