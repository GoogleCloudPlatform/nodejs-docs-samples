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
const childProcess = require(`child_process`);
const test = require(`ava`);
const uuid = require(`uuid`);
const Pubsub = require(`@google-cloud/pubsub`);
const pubsub = Pubsub();

const topicName = process.env.FUNCTIONS_TOPIC;
const baseCmd = `gcloud functions`;

test(`helloPubSub: should print a name`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();
  const name = uuid.v4();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(name));

  // Wait for logs to become consistent
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Check logs after a delay
  const logs = childProcess.execSync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`).toString();
  t.true(logs.includes(`Hello, ${name}!`));
});

test(`helloPubSub: should print hello world`, async (t) => {
  t.plan(1);
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(''), { a: 'b' });

  // Wait for logs to become consistent
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Check logs after a delay
  const logs = childProcess.execSync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`).toString();
  t.true(logs.includes('Hello, World!'));
});
// [END functions_pubsub_system_test]
