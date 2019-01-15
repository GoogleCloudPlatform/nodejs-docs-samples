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

const path = require(`path`);
const {PubSub} = require(`@google-cloud/pubsub`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cmd = `node gateway.js`;
const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;

const helper = `node manager.js`;
const cwdHelper = path.join(__dirname, `../../manager`);
const installDeps = `npm install`;
const publicKeyParam = `./resources/rsa_cert.pem`;
const privateKeyParam = `./resources/rsa_private.pem`;

const pubsub = new PubSub();

test.before(tools.checkCredentials);
test.before(async () => {
  let pubsubRes = await pubsub.createTopic(topicName);
  const topic = pubsubRes[0];
  console.log(`Topic ${topic.name} created.`);

  await tools.runAsync(installDeps, cwdHelper);
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwdHelper);
  await tools.runAsync(
    `${helper} createRegistry ${registryName} ${topicName}`,
    cwdHelper
  );
  console.log(`Registry ${registryName} created`);
});

test.after.always(async () => {
  await tools.runAsync(`${helper} deleteRegistry ${registryName}`, cwdHelper);
  console.log(`Registry ${registryName} was deleted`);

  const topic = pubsub.topic(topicName);
  await topic.delete();
  console.log(`Topic ${topic.name} deleted.`);
});

test(`should create a new gateway`, async t => {
  // create gateway
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  let gatewayOut = await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  ); // test no error on create gateway
  t.regex(gatewayOut, new RegExp('Created device'));

  // delete gateway with deleteDevice
  tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
});

test(`should list gateways`, async t => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // look for output in list gateway
  let gateways = await tools.runAsync(`${cmd} listGateways ${registryName}`);
  t.regex(gateways, new RegExp(`${gatewayId}`));

  tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
});

test(`should bind existing device to gateway`, async t => {
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
  let bind = await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  t.regex(bind, new RegExp('Device exists'));
  t.regex(bind, new RegExp('Bound device'));
  t.notRegex(bind, new RegExp('Could not bind device'));

  // test unbind
  let unbind = await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  t.regex(unbind, new RegExp('Device no longer bound'));

  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

test(`should bind new device to gateway`, async t => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // binding a non-existing device should create it
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  let bind = await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  t.regex(bind, new RegExp('Created device'));
  t.regex(bind, new RegExp('Bound device'));
  t.notRegex(bind, new RegExp('Could not bind device'));

  // unbind and delete device and gateway
  let unbind = await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  t.regex(unbind, new RegExp('Device no longer bound'));

  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwdHelper
  );
});

test(`should list devices bound to gateway`, async t => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // binding a non-existing device should create it
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  let devices = await tools.runAsync(
    `${cmd} listDevicesForGateway ${registryName} ${gatewayId}`
  );

  t.regex(devices, new RegExp(deviceId));
  t.notRegex(devices, new RegExp('No devices bound to this gateway.'));

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

test(`should list gateways for bound device`, async t => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  // binding a non-existing device should create it
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  let devices = await tools.runAsync(
    `${cmd} listGatewaysForDevice ${registryName} ${deviceId}`
  );

  t.regex(devices, new RegExp(gatewayId));
  t.notRegex(devices, new RegExp('No gateways associated with this device'));

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

test(`should listen for bound device config message`, async t => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  // listen for configuration changes
  let out = await tools.runAsync(
    `${cmd} listen ${deviceId} ${gatewayId} ${registryName} ${privateKeyParam} --clientDuration=30000`
  );

  t.regex(out, new RegExp('message received'));

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

test(`should listen for error topic messages`, async t => {
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
  let out = await tools.runAsync(
    `${cmd} listenForErrors ${gatewayId} ${registryName} ${deviceId} ${privateKeyParam} --clientDuration=30000`
  );

  t.regex(
    out,
    new RegExp(`DeviceId ${deviceId} is not associated with Gateway`)
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

test(`should send data from bound device`, async t => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256 ${publicKeyParam}`
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  // relay telemetry on behalf of device
  let out = await tools.runAsync(
    `${cmd} relayData ${deviceId} ${gatewayId} ${registryName} ${privateKeyParam} --numMessages=5`
  );

  t.regex(out, new RegExp('Publishing message 5/5'));
  t.notRegex(out, new RegExp('Error: Connection refused'));

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
