// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var PubSub = require('@google-cloud/pubsub');

// Instantiate a pubsub client
var pubsub = PubSub();

/**
 * Publishes a message to a Cloud Pub/Sub Topic.
 *
 * @example
 * gcloud alpha functions call publish --data '{"topic":"<your-topic-name>","message":"Hello World!"}'
 *
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by the user.
 * @param {string} data.topic Topic name on which to publish.
 * @param {string} data.message Message to publish.
 */
exports.publish = function publish (context, data) {
  try {
    if (!data.topic) {
      throw new Error('Topic not provided. Make sure you have a ' +
        '"topic" property in your request');
    }
    if (!data.message) {
      throw new Error('Message not provided. Make sure you have a ' +
        '"message" property in your request');
    }

    console.log('Publishing message to topic ' + data.topic);

    // The Pub/Sub topic must already exist.
    var topic = pubsub.topic(data.topic);

    // Pub/Sub messages must be valid JSON objects.
    return topic.publish({
      data: {
        message: data.message
      }
    }, function (err) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }
      return context.success('Message published');
    });
  } catch (err) {
    console.error(err);
    return context.failure(err.message);
  }
};

/**
 * Triggered from a message on a Pub/Sub topic.
 *
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by the Pub/Sub trigger.
 * @param {Object} data.message Message that was published via Pub/Sub.
 */
exports.subscribe = function subscribe (context, data) {
  // We're just going to log the message to prove that it worked!
  console.log(data.message);

  // Don't forget to call success!
  context.success();
};
