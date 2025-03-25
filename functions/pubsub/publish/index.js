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

'use strict';

// [START functions_pubsub_publish]
const {PubSub} = require('@google-cloud/pubsub');

// Instantiates a client
const pubsub = new PubSub();

/**
 * Publishes a message to a Cloud Pub/Sub Topic.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.topic Topic name on which to publish.
 * @param {string} req.body.message Message to publish.
 * @param {object} res Cloud Function response context.
 */
exports.publish = async (req, res) => {
  if (!req.body.topic || !req.body.message) {
    res
      .status(400)
      .send(
        'Missing parameter(s); include "topic" and "message" properties in your request.'
      );
    return;
  }

  console.log(`Publishing message to topic ${req.body.topic}`);

  // References an existing topic
  const topic = pubsub.topic(req.body.topic);

  const messageObject = {
    data: {
      message: req.body.message,
    },
  };
  const messageBuffer = Buffer.from(JSON.stringify(messageObject), 'utf8');

  // Publishes a message
  try {
    topic.publishMessage(messageBuffer);
    res.status(200).send('Message published.');
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
    return Promise.reject(err);
  }
};
// [END functions_pubsub_publish]
