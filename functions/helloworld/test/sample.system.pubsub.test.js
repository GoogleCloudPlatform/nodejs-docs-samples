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

// [START functions_pubsub_system_test]
const childProcess = require('child_process');
const delay = require('delay');
const assert = require('assert');
const uuid = require('uuid');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();

const topicName = process.env.FUNCTIONS_TOPIC;
const baseCmd = 'gcloud functions';

it('helloPubSub: should print a name', async () => {
  const startTime = new Date(Date.now()).toISOString();
  const name = uuid.v4();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(name));

  // Wait for logs to become consistent
  await delay(15000);

  // Check logs after a delay
  const logs = childProcess
    .execSync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`)
    .toString();
  assert.ok(logs.includes(`Hello, ${name}!`));
});
// [END functions_pubsub_system_test]

it('helloPubSub: should print hello world', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(''), {a: 'b'});

  // Wait for logs to become consistent
  await delay(15000);

  // Check logs after a delay
  const logs = childProcess
    .execSync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`)
    .toString();
  assert.ok(logs.includes('Hello, World!'));
});
