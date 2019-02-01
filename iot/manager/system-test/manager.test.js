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
const {PubSub} = require(`@google-cloud/pubsub`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;
const cmd = `node manager.js`;
const cwd = path.join(__dirname, `..`);

const installDeps = `npm install`;
const rsaPublicCert = process.env.NODEJS_IOT_RSA_PUBLIC_CERT;
const rsaPrivateKey = process.env.NODEJS_IOT_RSA_PRIVATE_KEY;

const ecPublicKey = process.env.NODEJS_IOT_EC_PUBLIC_KEY;

test.todo(tools.run(installDeps, `${cwd}/../mqtt_example`));
test.before(tools.checkCredentials);
test.before(async () => {
  const pubsub = new PubSub();
  return pubsub.createTopic(topicName).then(results => {
    const topic = results[0];
    console.log(`Topic ${topic.name} created.`);
    return topic;
  });
});

test.after.always(async () => {
  const pubsub = new PubSub();
  const topic = pubsub.topic(topicName);
  return topic.delete().then(() => {
    console.log(`Topic ${topic.name} deleted.`);
  });
});

test(`should create and delete an unauthorized device`, async t => {
  const localDevice = `test-device`;
  const localRegName = `${registryName}-unauth`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should list configs for a device`, async t => {
  const localDevice = `test-device-configs`;
  const localRegName = `${registryName}-unauth`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(
    `${cmd} getDeviceConfigs ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Configs`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and delete an RSA256 device`, async t => {
  const localDevice = `test-rsa-device`;
  const localRegName = `${registryName}-rsa256`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(
    `${cmd} getDeviceState ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`State`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and delete an ES256 device`, async t => {
  const localDevice = `test-es256-device`;
  const localRegName = `${registryName}-es256`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createEs256Device ${localDevice} ${localRegName} ${ecPublicKey}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(
    `${cmd} getDeviceState ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`State`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should patch an unauthorized device with RSA256`, async t => {
  const localDevice = `patchme`;
  const localRegName = `${registryName}-patchRSA`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(
    `${cmd} patchRsa256 ${localDevice} ${localRegName} ${rsaPublicCert}`,
    cwd
  );
  t.regex(output, new RegExp(`Patched device:`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should patch an unauthorized device with ES256`, async t => {
  const localDevice = `patchme`;
  const localRegName = `${registryName}-patchES`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(
    `${cmd} patchEs256 ${localDevice} ${localRegName} ${ecPublicKey}`,
    cwd
  );
  t.regex(output, new RegExp(`Patched device:`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and list devices`, async t => {
  const localDevice = `test-device`;
  const localRegName = `${registryName}-list`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(`${cmd} listDevices ${localRegName}`, cwd);
  t.regex(output, /Current devices in registry:/);
  t.regex(output, new RegExp(localDevice));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and get a device`, async t => {
  const localDevice = `test-device`;
  const localRegName = `${registryName}-get`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Created device`));
  output = await tools.runAsync(
    `${cmd} getDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Found device: ${localDevice}`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully deleted device`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and get an iam policy`, async t => {
  const localMember = `group:dpebot@google.com`;
  const localRole = `roles/viewer`;
  const localRegName = `${registryName}-get`;
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  output = await tools.runAsync(
    `${cmd} setIamPolicy ${localRegName} ${localMember} ${localRole}`,
    cwd
  );
  t.regex(output, new RegExp(`ETAG`));
  output = await tools.runAsync(`${cmd} getIamPolicy ${localRegName}`, cwd);
  t.regex(output, new RegExp(`dpebot`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${localRegName}`, cwd);
});

test(`should create and delete a registry`, async t => {
  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${registryName} ${topicName}`,
    cwd
  );
  t.regex(output, new RegExp(`Successfully created registry`));
  output = await tools.runAsync(`${cmd} deleteRegistry ${registryName}`, cwd);
  t.regex(output, new RegExp(`Successfully deleted registry`));
});

test(`should send command message to device`, async t => {
  const deviceId = `test-device-command`;
  const registryId = `${registryName}-rsa256`;
  const commandMessage = 'rotate 180 degrees';

  await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(`${cmd} createRegistry ${registryId} ${topicName}`, cwd);
  await tools.runAsync(
    `${cmd} createRsa256Device ${deviceId} ${registryId} ${rsaPublicCert}`,
    cwd
  );

  tools.runAsync(
    `node cloudiot_mqtt_example_nodejs.js --deviceId=${deviceId} --registryId=${registryId} --privateKeyFile=${rsaPrivateKey} --algorithm=RS256 --numMessages=30 --mqttBridgePort=443`,
    path.join(__dirname, '../../mqtt_example')
  );

  const output = await tools.runAsync(
    `${cmd} sendCommand ${deviceId} ${registryId} "${commandMessage}"`
  );

  t.regex(output, new RegExp('Success: OK'));

  await tools.runAsync(`${cmd} deleteDevice ${deviceId} ${registryId}`, cwd);
  await tools.runAsync(`${cmd} deleteRegistry ${registryId}`, cwd);
});


test.only(`should create a new gateway`, async t => {
  // create gateway
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  let gatewayOut = await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RS256_X509_PEM_X509_PEM ${rsaPublicCert}`
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
    `${cmd} createGateway ${registryName} ${gatewayId} RS256_X509_PEM ${rsaPublicCert}`
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
    `${cmd} createGateway ${registryName} ${gatewayId} RS256_X509_PEM ${rsaPublicCert}`
  );

  // create device
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${helper} createRsa256Device ${deviceId} ${registryName} ${rsaPublicCert}`,
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
    `${cmd} createGateway ${registryName} ${gatewayId} RS256_X509_PEM ${rsaPublicCert}`
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
    `${cmd} createGateway ${registryName} ${gatewayId} RS256_X509_PEM ${rsaPublicCert}`
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
    `${cmd} createGateway ${registryName} ${gatewayId} RS256_X509_PEM ${rsaPublicCert}`
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
