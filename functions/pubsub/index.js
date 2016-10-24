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

const PubSub = require('@google-cloud/pubsub');

// Instantiates a client
const pubsub = PubSub();

/**
 * Publishes a message to a Cloud Pub/Sub Topic.
 *
 * @example
 * gcloud alpha functions call publish --data '{"topic":"[YOUR_TOPIC_NAME]","message":"Hello, world!"}'
 *
 *   - Replace `[YOUR_TOPIC_NAME]` with your Cloud Pub/Sub topic name.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.topic Topic name on which to publish.
 * @param {string} req.body.message Message to publish.
 * @param {object} res Cloud Function response context.
 */
exports.publish = function publish (req, res) {
  if (!req.body.topic) {
    res.status(500).send(new Error('Topic not provided. Make sure you have a "topic" property in your request'));
    return;
  } else if (!req.body.message) {
    res.status(500).send(new Error('Message not provided. Make sure you have a "message" property in your request'));
    return;
  }

  console.log(`Publishing message to topic ${req.body.topic}`);

  // References an existing topic
  const topic = pubsub.topic(req.body.topic);

  const message = {
    data: {
      message: req.body.message
    }
  };

  // Publishes a message
  return topic.publish(message)
    .then(() => res.status(200).send('Message published.'))
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
};

/**
 * Triggered from a message on a Pub/Sub topic.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.payload The event payload.
 * @param {string} event.payload.message Message that was published to Pub/Sub.
 * @param {function} The callback function.
 */
exports.subscribe = function subscribe (event, callback) {
  // We're just going to log the message to prove that it worked!
  console.log(event.payload);

  // Don't forget to call the callback!
  callback();
};
