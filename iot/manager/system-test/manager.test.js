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

const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;
const cmd = `node manager.js`;
const cwd = path.join(__dirname, `..`);

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

test(`should create and delete an unauthorized device`, async (t) => {
  const localDevice = `test-device`;
  const localRegName = `${registryName}-unauth`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${localRegName} ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createUnauthDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Created device`));
  output = await tools.runAsync(
      `${cmd} deleteDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and delete an RSA256 device`, async (t) => {
  const localDevice = `test-rsa-device`;
  const localRegName = `${registryName}-rsa256`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${localRegName} ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`, cwd);
  t.true(output.includes(`Created device`));
  output = await tools.runAsync(
      `${cmd} deleteDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and delete an EC256 device`, async (t) => {
  const localDevice = `test-es-device`;
  const localRegName = `${registryName}-es256`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${localRegName} ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createEs256Device ${localDevice} ${localRegName} resources/ec_public.pem`, cwd);
  t.true(output.includes(`Created device`));
  output = await tools.runAsync(
      `${cmd} deleteDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should patch an unauthorized device with RSA256`, async (t) => {
  const localDevice = `patchme`;
  const localRegName = `${registryName}-patchRSA`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${localRegName} ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createUnauthDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Created device`));
  output = await tools.runAsync(
      `${cmd} patchRsa256 ${localDevice} ${localRegName} resources/rsa_cert.pem`, cwd);
  t.true(output.includes(`Patched device:`));
  output = await tools.runAsync(
      `${cmd} deleteDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should patch an unauthorized device with RSA256`, async (t) => {
  const localDevice = `patchme`;
  const localRegName = `${registryName}-patchES`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${localRegName} ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createUnauthDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Created device`));
  output = await tools.runAsync(
      `${cmd} patchEs256 ${localDevice} ${localRegName} resources/ec_public.pem`, cwd);
  t.true(output.includes(`Patched device:`));
  output = await tools.runAsync(
      `${cmd} deleteDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and list devices`, async (t) => {
  const localDevice = `test-device`;
  const localRegName = `${registryName}-list`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${localRegName} ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createUnauthDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Created device`));
  output = await tools.runAsync(
      `${cmd} listDevices ${localRegName}`, cwd);
  t.true(output.includes(`Current devices in registry: [ { id: '${localDevice}'`));
  output = await tools.runAsync(
      `${cmd} deleteDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and get a device`, async (t) => {
  const localDevice = `test-device`;
  const localRegName = `${registryName}-get`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${localRegName} ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createUnauthDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Created device`));
  output = await tools.runAsync(
      `${cmd} getDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Found device: ${localDevice}`));
  output = await tools.runAsync(
      `${cmd} deleteDevice ${localDevice} ${localRegName}`, cwd);
  t.true(output.includes(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and delete a registry`, async (t) => {
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
      `${cmd} createRegistry ${registryName} ${topicName}`, cwd);
  t.true(output.includes(`Successfully created registry`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${registryName}`, cwd);
  t.true(output.includes(`Successfully deleted registry`));
});
