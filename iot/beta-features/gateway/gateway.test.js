/**
 * Copyright 2018 Google LLC
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

const cmd = 'node gateway.js';
const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;

const helper = 'node manager.js';
const cwdHelper = path.join(__dirname, '../../manager');
const installDeps = 'npm install';
const publicKeyParam = process.env.NODEJS_IOT_RSA_PUBLIC_CERT;
const privateKeyParam = process.env.NODEJS_IOT_RSA_PRIVATE_KEY;

const pubsub = new PubSub();

before(async () => {
  tools.checkCredentials();
  const [topic] = await pubsub.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);

  await tools.runAsync(installDeps, cwdHelper);
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwdHelper);
  await tools.runAsync(
    `${helper} createRegistry ${registryName} ${topicName}`,
    cwdHelper
  );
  console.log(`Registry ${registryName} created`);
});

after(async () => {
  await tools.runAsync(`${helper} deleteRegistry ${registryName}`, cwdHelper);
  console.log(`Registry ${registryName} was deleted`);

  const topic = pubsub.topic(topicName);
  await topic.delete();
  console.log(`Topic ${topic.name} deleted.`);
});

it('should create a new gateway', async () => {
  // create gateway
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  const gatewayOut = await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  ); // test no error on create gateway
  assert.strictEqual(new RegExp('Created device').test(gatewayOut), true);

  // delete gateway with deleteDevice
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
});

it('should list gateways', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // look for output in list gateway
  const gateways = await tools.runAsync(`${cmd} listGateways ${registryName}`);
  assert.strictEqual(new RegExp(`${gatewayId}`).test(gateways), true);

  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
});

it('should bind existing device to gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // create device
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${helper} createRsa256Device ${deviceId} ${registryName} ${publicKeyParam}`,
    cwdHelper
  );

  // bind device to gateway
  const bind = await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  assert.strictEqual(new RegExp('Device exists').test(bind), true);
  assert.strictEqual(new RegExp('Bound device').test(bind), true);
  assert.strictEqual(new RegExp('Could not bind device').test(bind), false);

  // test unbind
  const unbind = await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  assert.strictEqual(new RegExp('Device no longer bound').test(unbind), true);

  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

it('should bind new device to gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // binding a non-existing device should create it
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  const bind = await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  assert.strictEqual(new RegExp('Created device').test(bind), true);
  assert.strictEqual(new RegExp('Bound device').test(bind), true);
  assert.strictEqual(new RegExp('Could not bind device').test(bind), false);

  // unbind and delete device and gateway
  const unbind = await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  assert.strictEqual(new RegExp('Device no longer bound').test(unbind), true);

  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

it('should list devices bound to gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // binding a non-existing device should create it
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  const devices = await tools.runAsync(
    `${cmd} listDevicesForGateway ${registryName} ${gatewayId}`
  );

  assert.strictEqual(new RegExp(deviceId).test(devices), true);
  assert.strictEqual(new RegExp('No devices bound').test(devices), false);
  // cleanup
  await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

it('should list gateways for bound device', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // binding a non-existing device should create it
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  const devices = await tools.runAsync(
    `${cmd} listGatewaysForDevice ${registryName} ${deviceId}`
  );

  assert.strictEqual(new RegExp(gatewayId).test(devices), true);
  assert.strictEqual(
    new RegExp('No gateways associated with this device').test(devices),
    false
  );

  // cleanup
  await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

it('should listen for bound device config message', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  // listen for configuration changes
  const out = await tools.runAsync(
    `${cmd} listen ${deviceId} ${gatewayId} ${registryName} ${privateKeyParam} --clientDuration=30000`
  );

  assert.strictEqual(new RegExp('message received').test(out), true);

  // cleanup
  await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

it('should listen for error topic messages', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // create a device but don't associate it with the gateway
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${helper} createRsa256Device ${deviceId} ${registryName} ${publicKeyParam}`,
    cwdHelper
  );

  // check error topic contains error of attaching a device that is not bound
  const out = await tools.runAsync(
    `${cmd} listenForErrors ${gatewayId} ${registryName} ${deviceId} ${privateKeyParam} --clientDuration=30000`
  );

  assert.strictEqual(
    new RegExp(`DeviceId ${deviceId} is not associated with Gateway`).test(out),
    true
  );

  // cleanup
  await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

it('should send data from bound device', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  // relay telemetry on behalf of device
  const out = await tools.runAsync(
    `${cmd} relayData ${deviceId} ${gatewayId} ${registryName} ${privateKeyParam} --numMessages=5`
  );

  assert.strictEqual(new RegExp('Publishing message 5/5').test(out), true);
  assert.strictEqual(new RegExp('Error: Connection refused').test(out), false);

  await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});
