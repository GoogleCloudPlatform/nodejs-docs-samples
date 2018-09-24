/**
 * Copyright 2017, Google, Inc.
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

const path = require(`path`);
const PubSub = require(`@google-cloud/pubsub`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const deviceId = `test-node-device`;
const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;
const helper = `node ../manager/manager.js`;
const cmd = `node cloudiot_http_example.js --registryId="${registryName}" --deviceId="${deviceId}" `;
const cwd = path.join(__dirname, `..`);
const installDeps = `pushd ../manager && npm install`;

test.before(tools.checkCredentials);
test.before(async () => {
  const pubsub = PubSub();
  return pubsub.createTopic(topicName)
    .then((results) => {
      const topic = results[0];
      console.log(`Topic ${topic.name} created.`);
      return topic;
    });
});

test.after.always(async () => {
  const pubsub = PubSub();
  const topic = pubsub.topic(topicName);
  return topic.delete()
    .then(() => {
      console.log(`Topic ${topic.name} deleted.`);
    });
});

test(`should receive configuration message`, async (t) => {
  const localDevice = `test-rsa-device`;
  const localRegName = `${registryName}-rsa256`;

  await tools.runAsync(installDeps, cwd);
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`, cwd);

  const output = await tools.runAsync(
    `${cmd} --messageType=events --numMessages=1 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256`, cwd);

  t.regex(output, new RegExp(/Getting config/));

  // Check / cleanup
  await tools.runAsync(`${helper} getDeviceState ${localDevice} ${localRegName}`, cwd);
  await tools.runAsync(`${helper} deleteDevice ${localDevice} ${localRegName}`, cwd);
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

test(`should send event message`, async (t) => {
  const localDevice = `test-rsa-device`;
  const localRegName = `${registryName}-rsa256`;

  await tools.runAsync(installDeps, cwd);
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`, cwd);

  const output = await tools.runAsync(
    `${cmd} --messageType=events --numMessages=1 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256`, cwd);

  t.regex(output, new RegExp(/Publishing message/));

  // Check / cleanup
  await tools.runAsync(`${helper} getDeviceState ${localDevice} ${localRegName}`, cwd);
  await tools.runAsync(`${helper} deleteDevice ${localDevice} ${localRegName}`, cwd);
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

test(`should send event message`, async (t) => {
  const localDevice = `test-rsa-device`;
  const localRegName = `${registryName}-rsa256`;
  await tools.runAsync(installDeps, cwd);
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`, cwd);

  const output = await tools.runAsync(
    `${cmd} --messageType=state --numMessages=1 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256`, cwd);
  t.regex(output, new RegExp(/Publishing message/));

  // Check / cleanup
  await tools.runAsync(`${helper} getDeviceState ${localDevice} ${localRegName}`, cwd);
  await tools.runAsync(`${helper} deleteDevice ${localDevice} ${localRegName}`, cwd);
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});
