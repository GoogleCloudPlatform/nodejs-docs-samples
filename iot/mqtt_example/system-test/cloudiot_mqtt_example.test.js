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

const iot = require('@google-cloud/iot');
const path = require('path');
const {PubSub} = require('@google-cloud/pubsub');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');

const projectId =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
const topicName = `nodejs-iot-test-mqtt-topic-${uuid.v4()}`;
const registryName = `nodejs-iot-test-mqtt-registry-${uuid.v4()}`;
const region = `us-central1`;
const rsaPublicCert = process.env.NODEJS_IOT_RSA_PUBLIC_CERT;
const rsaPrivateKey = process.env.NODEJS_IOT_RSA_PRIVATE_KEY;

const helper = 'node ../manager/manager.js';
const cmd = 'node cloudiot_mqtt_example_nodejs.js ';
const cmdSuffix = ` --numMessages=1 --privateKeyFile=${rsaPrivateKey} --algorithm=RS256`;
const cwd = path.join(__dirname, '..');
const installDeps = 'npm install';

const iotClient = new iot.v1.DeviceManagerClient();
const pubSubClient = new PubSub({projectId});

assert.ok(tools.run(installDeps, `${cwd}/../manager`));
before(async () => {
  tools.checkCredentials();
  // Create a unique topic to be used for testing.
  const [topic] = await pubSubClient.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);

  // Creates a registry to be used for tests.
  const createRegistryRequest = {
    parent: iotClient.locationPath(projectId, region),
    deviceRegistry: {
      id: registryName,
      eventNotificationConfigs: [
        {
          pubsubTopicName: topic.name,
        },
      ],
    },
  };
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);

  await iotClient.createDeviceRegistry(createRegistryRequest);
  console.log(`Created registry: ${registryName}`);
});

after(async () => {
  await pubSubClient.topic(topicName).delete();
  console.log(`Topic ${topicName} deleted.`);

  // Cleans up the registry by removing all associations and deleting all devices.
  tools.run(`${helper} unbindAllDevices ${registryName}`, cwd);
  tools.run(`${helper} clearRegistry ${registryName}`, cwd);

  console.log('Deleted test registry.');
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
    `${helper} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    cwd
  );

  output = await tools.runAsync(
    `${cmd} mqttDeviceDemo --messageType=events --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
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
    `${helper} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    cwd
  );

  const output = await tools.runAsync(
    `${cmd} mqttDeviceDemo --messageType=events --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
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
    `${helper} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    cwd
  );

  const output = await tools.runAsync(
    `${cmd} mqttDeviceDemo --messageType=state --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
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
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  const localRegName = `${registryName}-rsa256`;
  const message = 'rotate 180 degrees';

  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} createRsa256Device ${deviceId} ${localRegName} ${rsaPublicCert}`,
    cwd
  );

  const output = tools.runAsync(
    `${cmd} mqttDeviceDemo --registryId=${localRegName} --deviceId=${deviceId} --numMessages=30 --privateKeyFile=${rsaPrivateKey} --algorithm=RS256 --mqttBridgePort=443`,
    cwd
  );

  await tools.runAsync(
    `${helper} sendCommand ${deviceId} ${localRegName} "${message}"`,
    cwd
  );

  assert.strictEqual(
    new RegExp(`Command message received: ${message}`).test(await output),
    true
  );

  // Cleanup
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${localRegName}`,
    cwd
  );
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

it('should listen for bound device config message', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${helper} createGateway ${registryName} ${gatewayId} --publicKeyFormat=RSA_X509_PEM --publicKeyFile=${rsaPublicCert}`,
    cwd
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;

  await tools.runAsync(
    `${helper} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`,
    cwd
  );

  // listen for configuration changes
  const out = await tools.runAsync(
    `${cmd} listenForConfigMessages --deviceId=${deviceId} --gatewayId=${gatewayId} --registryId=${registryName} --privateKeyFile=${rsaPrivateKey} --clientDuration=10000 --algorithm=RS256`
  );

  assert.strictEqual(new RegExp('message received').test(out), true);

  // cleanup
  await tools.runAsync(
    `${helper} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwd
  );
});

it('should listen for error topic messages', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${helper} createGateway ${registryName} ${gatewayId} --publicKeyFormat=RSA_X509_PEM --publicKeyFile=${rsaPublicCert}`,
    cwd
  );

  // create a device but don't associate it with the gateway
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${helper} createRsa256Device ${deviceId} ${registryName} ${rsaPublicCert}`,
    cwd
  );

  // check error topic contains error of attaching a device that is not bound
  const out = await tools.runAsync(
    `${cmd} listenForErrorMessages --gatewayId=${gatewayId} --registryId=${registryName} --deviceId=${deviceId} --privateKeyFile=${rsaPrivateKey} --clientDuration=30000 --algorithm=RS256`
  );

  assert.strictEqual(
    new RegExp(`DeviceId ${deviceId} is not associated with Gateway`).test(out),
    true
  );

  // cleanup
  await tools.runAsync(
    `${helper} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwd
  );
});

it('should send data from bound device', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${helper} createGateway ${registryName} ${gatewayId} --publicKeyFormat=RSA_X509_PEM --publicKeyFile=${rsaPublicCert}`,
    cwd
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await iotClient.createDevice({
    parent: iotClient.registryPath(projectId, region, registryName),
    device: {
      id: deviceId,
    },
  });

  await tools.runAsync(
    `${helper} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`,
    cwd
  );

  // relay telemetry on behalf of device
  const out = await tools.runAsync(
    `${cmd} sendDataFromBoundDevice --deviceId=${deviceId} --gatewayId=${gatewayId} --registryId=${registryName} --privateKeyFile=${rsaPrivateKey} --numMessages=5 --algorithm=RS256`
  );

  assert.strictEqual(new RegExp('Publishing message 5/5').test(out), true);
  assert.strictEqual(new RegExp('Error: Connection refused').test(out), false);

  await tools.runAsync(
    `${helper} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${gatewayId} ${registryName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} deleteDevice ${deviceId} ${registryName}`,
    cwd
  );
});
