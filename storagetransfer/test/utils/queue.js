/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {PubSub} = require('@google-cloud/pubsub');
const AWS = require('aws-sdk');
const uuid = require('uuid');

class QueueManager {
  constructor() {
    this.pubsub = new PubSub();
    AWS.config.update({region: 'us-west-1'});
    this.sqs = new AWS.SQS({apiVersion: '2012-11-05'});

    /**
     * @type {Topic[]}
     */
    this.pubsubTopics = [];
    /**
     * @type {Subscription[]}
     */
    this.pubsubSubscriptions = [];
    /**
     * @type {string[]}
     */
    this.sqsQueues = [];
  }

  async generatePubsubSubscriptionId() {
    const topicId = `sts-topic-id-${uuid.v4()}`;
    const topic = await this.pubsub.createTopic(topicId);
    this.pubsubTopics.push(topic[0]);
    const subscriptionId = `sts-subscription-id-${uuid.v4()}`;
    const subscription = await this.pubsub
      .topic(topicId)
      .createSubscription(subscriptionId);
    this.pubsubSubscriptions.push(subscription[0]);

    return subscription[0].name;
  }

  async deletePubsubSubscriptionsAndTopics() {
    for (const s of this.pubsubSubscriptions) {
      this.pubsub.subscription(s.name).delete();
    }
    for (const t of this.pubsubTopics) {
      this.pubsub.topic(t.name).delete();
    }
  }

  async generateSqsQueueArn() {
    return await new Promise((resolve, reject) => {
      const queueName = `sts-queue-name-${uuid.v4()}`;
      this.sqs.createQueue(
        {QueueName: queueName},
        (error, createQueueResult) => {
          if (error) {
            console.error(error);
            return reject(error);
          }
          this.sqsQueues.push(createQueueResult.QueueUrl);
          this.sqs.getQueueAttributes(
            {
              QueueUrl: createQueueResult.QueueUrl,
              AttributeNames: ['QueueArn'],
            },
            (err, data) => {
              if (err) {
                console.error(err);
                return reject(err);
              }
              resolve(data.Attributes['QueueArn']);
            }
          );
        }
      );
    });
  }

  async deleteSqsQueues() {
    for (const q of this.sqsQueues) {
      await this.sqs.deleteQueue({QueueUrl: q}).promise();
    }
  }
}

module.exports = {QueueManager};
