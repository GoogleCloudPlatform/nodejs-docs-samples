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

var gcloud = require('gcloud');

// Create a pubsub client.
var pubsub = gcloud.pubsub();

module.exports = {
  /**
   * Publishes a message to a Cloud Pub/Sub Topic.
   */
  publish: function (context, data) {
    var topicName = data.topic;
    var message = data.message;

    if (!topicName) {
      return context.failure('Topic not provided. Make sure you have a ' +
        '"topic" property in your request');
    }
    if (!message) {
      return context.failure('Message not provided. Make sure you have a ' +
        '"message" property in your request');
    }

    console.log('Publishing message to topic ' + topicName);

    // The Pub/Sub topic must already exist.
    var topic = pubsub.topic(topicName);

    // Pub/Sub messages must be valid JSON objects.
    topic.publish({
      data: {
        message: message
      }
    }, function (err) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }
      context.success('Message published');
    });
  },

  /**
   * Triggered from a message on a Pub/Sub topic.
   */
  subscribe: function (context, data) {
    // We're just going to log the message to prove that it worked!
    console.log(data['message']);

    // Don't forget to call success!
    context.success();
  }
};
