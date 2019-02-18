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

const path = require('path');
const {PubSub} = require('@google-cloud/pubsub');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');

const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;
const helper = 'node ../manager/manager.js';
const cmd = 'node cloudiot_mqtt_example_nodejs.js ';
const cmdSuffix =
  ' --numMessages=1 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256';
const cwd = path.join(__dirname, '..');
const installDeps = 'npm install';

assert.ok(tools.run(installDeps, `${cwd}/../manager`));
before(async () => {
  tools.checkCredentials();
  const pubsub = new PubSub();
  const [topic] = pubsub.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);
});

after(async () => {
  const pubsub = new PubSub();
  const topic = pubsub.topic(topicName);
  await topic.delete();
  console.log(`Topic ${topic.name} deleted.`);
});

it('should receive configuration message', async () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;

  let output = await tools.runAsync(
    `${helper} setupIotTopic ${topicName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`,
    cwd
  );

  output = await tools.runAsync(
    `${cmd}  --messageType=events --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
    cwd
  );

  assert.strictEqual(new RegExp('connect').test(output), true);
  assert.strictEqual(new RegExp('Config message received:').test(output), true);

  // Check / cleanup
  await tools.runAsync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

it('should send event message', async () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;

  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`,
    cwd
  );

  const output = await tools.runAsync(
    `${cmd} --messageType=events --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
    cwd
  );
  assert.strictEqual(new RegExp('Publishing message:').test(output), true);

  // Check / cleanup
  await tools.runAsync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

it('should send state message', async () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`,
    cwd
  );

  const output = await tools.runAsync(
    `${cmd} --messageType=state --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
    cwd
  );
  assert.strictEqual(new RegExp('Publishing message:').test(output), true);

  // Check / cleanup
  await tools.runAsync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

it('should receive command message', async () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;
  const message = 'rotate 180 degrees';

  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`,
    cwd
  );

  let output = tools.runAsync(
    `${cmd} --registryId=${localRegName} --deviceId=${localDevice} --numMessages=30 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256 --mqttBridgePort=443`,
    cwd
  );

  await tools.runAsync(
    `${helper} sendCommand ${localDevice} ${localRegName} "${message}"`,
    cwd
  );

  assert.strictEqual(
    new RegExp(`Command message received: ${message}`).test(await output),
    true
  );

  // Cleanup
  await tools.runAsync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});
