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

const topicName = `nodejs-iot-test-topic-${uuid.v4()}`;
const registryName = `nodejs-iot-test-registry-${uuid.v4()}`;
const region = 'us-central1';
const projectId =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;

const cmd = 'node manager.js';
const cwd = path.join(__dirname, '..');
const installDeps = 'npm install';
const rsaPublicCert = process.env.NODEJS_IOT_RSA_PUBLIC_CERT;
const rsaPrivateKey = process.env.NODEJS_IOT_RSA_PRIVATE_KEY;
const ecPublicKey = process.env.NODEJS_IOT_EC_PUBLIC_KEY;

const iotClient = new iot.v1.DeviceManagerClient();
const pubSubClient = new PubSub({projectId});

before(async () => {
  tools.run(installDeps, `${cwd}/../mqtt_example`);
  tools.checkCredentials();
  // Create a topic to be used for testing.
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
  await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);

  await iotClient.createDeviceRegistry(createRegistryRequest);
  console.log(`Created registry: ${registryName}`);
});

after(async () => {
  await pubSubClient.topic(topicName).delete();
  console.log(`Topic ${topicName} deleted.`);

  // Cleans up the registry by removing all associations and deleting all devices.
  tools.run(`${cmd} unbindAllDevices ${registryName}`, cwd);
  tools.run(`${cmd} clearRegistry ${registryName}`, cwd);

  console.log('Deleted test registry.');
});

it('should create and delete an unauthorized device', async () => {
  const localDevice = 'test-device-unauth-delete';

  let output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should list configs for a device', async () => {
  const localDevice = 'test-device-configs';
  let output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(
    `${cmd} getDeviceConfigs ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Configs'));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and delete an RSA256 device', async () => {
  const localDevice = 'test-rsa-device';
  let output = await tools.runAsync(
    `${cmd} createRsa256Device ${localDevice} ${registryName} ${rsaPublicCert}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(
    `${cmd} getDeviceState ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('State'));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and delete an ES256 device', async () => {
  const localDevice = 'test-es256-device';
  let output = await tools.runAsync(
    `${cmd} createEs256Device ${localDevice} ${registryName} ${ecPublicKey}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(
    `${cmd} getDeviceState ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('State'));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should patch an unauthorized device with RSA256', async () => {
  const localDevice = 'test-device-patch-rs256';
  let output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(
    `${cmd} patchRsa256 ${localDevice} ${registryName} ${rsaPublicCert}`,
    cwd
  );
  assert.ok(output.includes('Patched device:'));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should patch an unauthorized device with ES256', async () => {
  const localDevice = 'test-device-patch-es256';
  let output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(
    `${cmd} patchEs256 ${localDevice} ${registryName} ${ecPublicKey}`,
    cwd
  );
  assert.ok(output.includes('Patched device:'));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and list devices', async () => {
  const localDevice = 'test-device-list';
  let output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(`${cmd} listDevices ${registryName}`, cwd);
  assert.ok(output.includes('Current devices in registry:'));
  assert.ok(output.includes(localDevice));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and get a device', async () => {
  const localDevice = 'test-device-get';

  let output = await tools.runAsync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = await tools.runAsync(
    `${cmd} getDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes(`Found device: ${localDevice}`));
  output = await tools.runAsync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
});

it('should create and get an iam policy', async () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = await tools.runAsync(
    `${cmd} setIamPolicy ${registryName} ${localMember} ${localRole}`,
    cwd
  );
  assert.ok(output.includes('ETAG'));

  output = await tools.runAsync(`${cmd} getIamPolicy ${registryName}`, cwd);
  assert.ok(output.includes('dpebot'));
});

it('should create and delete a registry', async () => {
  const createRegistryId = registryName + 'create';

  let output = await tools.runAsync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = await tools.runAsync(
    `${cmd} createRegistry ${createRegistryId} ${topicName}`,
    cwd
  );
  assert.ok(output.includes('Successfully created registry'));
  output = await tools.runAsync(
    `${cmd} deleteRegistry ${createRegistryId}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted registry'));
});

it('should send command message to device', async () => {
  const deviceId = 'test-device-command';
  const commandMessage = 'rotate 180 degrees';

  await tools.runAsync(
    `${cmd} createRsa256Device ${deviceId} ${registryName} ${rsaPublicCert}`,
    cwd
  );

  tools.runAsync(
    `node cloudiot_mqtt_example_nodejs.js mqttDeviceDemo --deviceId=${deviceId} --registryId=${registryName} --privateKeyFile=${rsaPrivateKey} --algorithm=RS256 --numMessages=20 --mqttBridgePort=8883`,
    path.join(__dirname, '../../mqtt_example')
  );

  const output = await tools.runAsync(
    `${cmd} sendCommand ${deviceId} ${registryName} ${commandMessage}`
  );
  assert.ok(output.includes('Sent command'));

  await tools.runAsync(`${cmd} deleteDevice ${deviceId} ${registryName}`, cwd);
});

it('should create a new gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  const gatewayOut = await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RSA_X509_PEM ${rsaPublicCert}`
  );

  // test no error on create gateway.
  assert.ok(gatewayOut.includes('Created device'));

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });
});

it('should list gateways', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RSA_X509_PEM ${rsaPublicCert}`
  );

  // look for output in list gateway
  const gateways = await tools.runAsync(`${cmd} listGateways ${registryName}`);
  assert.ok(gateways.includes(`${gatewayId}`));

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });
});

it('should bind existing device to gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RSA_X509_PEM ${rsaPublicCert}`
  );

  // create device
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await iotClient.createDevice({
    parent: iotClient.registryPath(projectId, region, registryName),
    device: {
      id: deviceId,
    },
  });

  // bind device to gateway
  const bind = await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  assert.ok(bind.includes(`Binding device: ${deviceId}`));
  assert.strictEqual(bind.includes('Could not bind device'), false);

  // test unbind
  const unbind = await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );
  assert.ok(unbind.includes(`Unbound ${deviceId} from ${gatewayId}`));

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, deviceId),
  });
});

it('should list devices bound to gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RSA_X509_PEM ${rsaPublicCert}`
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await iotClient.createDevice({
    parent: iotClient.registryPath(projectId, region, registryName),
    device: {
      id: deviceId,
    },
  });

  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  const devices = await tools.runAsync(
    `${cmd} listDevicesForGateway ${registryName} ${gatewayId}`
  );

  assert.ok(devices.includes(deviceId));
  assert.strictEqual(
    devices.includes('No devices bound to this gateway.'),
    false
  );

  // cleanup
  await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, deviceId),
  });
});

it('should list gateways for bound device', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  await tools.runAsync(
    `${cmd} createGateway ${registryName} ${gatewayId} RSA_X509_PEM ${rsaPublicCert}`
  );

  // create device
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await iotClient.createDevice({
    parent: iotClient.registryPath(projectId, region, registryName),
    device: {
      id: deviceId,
    },
  });

  await tools.runAsync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  const devices = await tools.runAsync(
    `${cmd} listGatewaysForDevice ${registryName} ${deviceId}`
  );

  assert.ok(devices.includes(gatewayId));
  assert.strictEqual(
    devices.includes('No gateways associated with this device'),
    false
  );

  // cleanup
  await tools.runAsync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, deviceId),
  });
});
