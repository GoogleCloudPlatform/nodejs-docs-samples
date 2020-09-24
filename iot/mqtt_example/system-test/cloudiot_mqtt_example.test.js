// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');
const childProcess = require('child_process');
const iot = require('@google-cloud/iot');
const path = require('path');
const {PubSub} = require('@google-cloud/pubsub');
const util = require('util');
const uuid = require('uuid');

const projectId =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
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

assert.ok(
  childProcess.execSync(installDeps, {cwd: `${cwd}/../manager`, shell: true})
);
before(async () => {
  assert(
    process.env.GOOGLE_CLOUD_PROJECT,
    `Must set GOOGLE_CLOUD_PROJECT environment variable!`
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
  );
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
  childProcess.execSync(`${helper} setupIotTopic ${topicName}`, {
    cwd,
    shell: true,
  });

  await iotClient.createDeviceRegistry(createRegistryRequest);
  console.log(`Created registry: ${registryName}`);
});

after(async () => {
  await pubSubClient.topic(topicName).delete();
  console.log(`Topic ${topicName} deleted.`);

  // Cleans up the registry by removing all associations and deleting all devices.
  childProcess.execSync(`${helper} unbindAllDevices ${registryName}`, {
    cwd,
    shell: true,
  });
  childProcess.execSync(`${helper} clearRegistry ${registryName}`, {
    cwd,
    shell: true,
  });

  console.log('Deleted test registry.');
});

it('should receive configuration message', () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;

  let output = childProcess.execSync(`${helper} setupIotTopic ${topicName}`, {
    cwd,
    shell: true,
  });
  childProcess.execSync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    {cwd, shell: true}
  );

  output = childProcess.execSync(
    `${cmd} mqttDeviceDemo --messageType=events --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
    {cwd, shell: true}
  );

  assert.strictEqual(new RegExp('connect').test(output), true);
  assert.strictEqual(new RegExp('Config message received:').test(output), true);

  // Check / cleanup
  childProcess.execSync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(`${helper} deleteRegistry ${localRegName}`, {
    cwd,
    shell: true,
  });
});

it('should send event message', () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;

  childProcess.execSync(`${helper} setupIotTopic ${topicName}`, {
    cwd,
    shell: true,
  });
  childProcess.execSync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    {cwd, shell: true}
  );

  const output = childProcess.execSync(
    `${cmd} mqttDeviceDemo --messageType=events --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
    {cwd, shell: true}
  );
  assert.strictEqual(new RegExp('Publishing message:').test(output), true);

  // Check / cleanup
  childProcess.execSync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

it('should send state message', () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;
  childProcess.execSync(`${helper} setupIotTopic ${topicName}`, {
    cwd,
    shell: true,
  });
  childProcess.execSync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    {cwd, shell: true}
  );

  const output = childProcess.execSync(
    `${cmd} mqttDeviceDemo --messageType=state --registryId="${localRegName}" --deviceId="${localDevice}" ${cmdSuffix}`,
    {cwd, shell: true}
  );
  assert.strictEqual(new RegExp('Publishing message:').test(output), true);

  // Check / cleanup
  childProcess.execSync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  childProcess.execSync(`${helper} deleteRegistry ${localRegName}`, {
    cwd,
    shell: true,
  });
});

it.only('should receive command message', async () => {
  const deviceId = `commands-device`;
  const message = 'rotate 180 degrees';

  childProcess.execSync(
    `${helper} createRsa256Device ${deviceId} ${registryName} ${rsaPublicCert}`,
    {cwd, shell: true}
  );

  const exec = util.promisify(childProcess.exec);

  const output = exec(
    `${cmd} mqttDeviceDemo --registryId=${registryName} --deviceId=${deviceId} --numMessages=30 --privateKeyFile=${rsaPrivateKey} --algorithm=RS256 --mqttBridgePort=8883`,
    {cwd, shell: true}
  );

  childProcess.execSync(
    `${helper} sendCommand ${deviceId} ${registryName} "${message}"`,
    {cwd, shell: true}
  );

  const {stdout} = await output;

  assert.strictEqual(
    new RegExp(`Command message received: ${message}`).test(stdout),
    true
  );

  // Cleanup
  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, deviceId),
  });
});

it('should listen for bound device config message', () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  childProcess.execSync(
    `${helper} createGateway ${registryName} ${gatewayId} --publicKeyFormat=RSA_X509_PEM --publicKeyFile=${rsaPublicCert}`,
    {cwd, shell: true}
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;

  childProcess.execSync(
    `${helper} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`,
    {cwd, shell: true}
  );

  // listen for configuration changes
  const out = childProcess.execSync(
    `${cmd} listenForConfigMessages --deviceId=${deviceId} --gatewayId=${gatewayId} --registryId=${registryName} --privateKeyFile=${rsaPrivateKey} --clientDuration=10000 --algorithm=RS256`,
    {cwd, shell: true}
  );

  assert.strictEqual(new RegExp('message received').test(out), true);

  // cleanup
  childProcess.execSync(
    `${helper} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`,
    {cwd, shell: true}
  );
  childProcess.execSync(`${helper} deleteDevice ${gatewayId} ${registryName}`, {
    cwd,
    shell: true,
  });
  childProcess.execSync(`${helper} deleteDevice ${deviceId} ${registryName}`, {
    cwd,
    shell: true,
  });
});

it('should listen for error topic messages', () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  childProcess.execSync(
    `${helper} createGateway ${registryName} ${gatewayId} --publicKeyFormat=RSA_X509_PEM --publicKeyFile=${rsaPublicCert}`,
    {cwd, shell: true}
  );
  // create a device but don't associate it with the gateway
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  childProcess.execSync(
    `${helper} createRsa256Device ${deviceId} ${registryName} ${rsaPublicCert}`,
    {cwd, shell: true}
  );

  // check error topic contains error of attaching a device that is not bound
  const out = childProcess.execSync(
    `${cmd} listenForErrorMessages --gatewayId=${gatewayId} --registryId=${registryName} --deviceId=${deviceId} --privateKeyFile=${rsaPrivateKey} --clientDuration=30000 --algorithm=RS256`,
    {cwd, shell: true}
  );

  assert.strictEqual(
    new RegExp(`DeviceId ${deviceId} is not associated with Gateway`).test(out),
    true
  );

  // cleanup
  childProcess.execSync(
    `${helper} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`,
    {cwd, shell: true}
  );
  childProcess.execSync(`${helper} deleteDevice ${gatewayId} ${registryName}`, {
    cwd,
    shell: true,
  });
  childProcess.execSync(`${helper} deleteDevice ${deviceId} ${registryName}`, {
    cwd,
    shell: true,
  });
});

it('should send data from bound device', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  childProcess.execSync(
    `${helper} createGateway ${registryName} ${gatewayId} --publicKeyFormat=RSA_X509_PEM --publicKeyFile=${rsaPublicCert}`,
    {cwd, shell: true}
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await iotClient.createDevice({
    parent: iotClient.registryPath(projectId, region, registryName),
    device: {
      id: deviceId,
    },
  });

  childProcess.execSync(
    `${helper} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`,
    {cwd, shell: true}
  );

  // relay telemetry on behalf of device
  const out = childProcess.execSync(
    `${cmd} sendDataFromBoundDevice --deviceId=${deviceId} --gatewayId=${gatewayId} --registryId=${registryName} --privateKeyFile=${rsaPrivateKey} --numMessages=5 --algorithm=RS256`,
    {cwd, shell: true}
  );

  assert.strictEqual(new RegExp('Publishing message 5/5').test(out), true);
  assert.strictEqual(new RegExp('Error: Connection refused').test(out), false);

  childProcess.execSync(
    `${helper} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`,
    {cwd, shell: true}
  );
  childProcess.execSync(`${helper} deleteDevice ${gatewayId} ${registryName}`, {
    cwd,
    shell: true,
  });
  childProcess.execSync(`${helper} deleteDevice ${deviceId} ${registryName}`, {
    cwd,
    shell: true,
  });
});
