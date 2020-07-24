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

const iot = require('@google-cloud/iot');
const path = require('path');
const {PubSub} = require('@google-cloud/pubsub');
const assert = require('assert');
const uuid = require('uuid');
const childProcess = require('child_process');

const topicName = `nodejs-iot-test-topic-${uuid.v4()}`;
const registryName = `nodejs-iot-test-registry-${uuid.v4()}`;
const region = 'us-central1';
const projectId =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;

const cmd = 'node manager.js';
const cwd = path.join(__dirname, '..');
const installDeps = 'npm install';
const rsaPublicCert = process.env.NODEJS_IOT_RSA_PUBLIC_CERT;
const rsaPrivateKey = process.env.NODEJS_IOT_RSA_PRIVATE_KEY;
const ecPublicKey = process.env.NODEJS_IOT_EC_PUBLIC_KEY;

const iotClient = new iot.v1.DeviceManagerClient();
const pubSubClient = new PubSub({projectId});

before(async () => {
  childProcess.execSync(installDeps, {
    cwd: `${cwd}/../mqtt_example`,
    shell: true,
  });
  assert(
    process.env.GOOGLE_CLOUD_PROJECT,
    `Must set GOOGLE_CLOUD_PROJECT environment variable!`
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
  );
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
  childProcess.execSync(`${cmd} setupIotTopic ${topicName}`, cwd);

  await iotClient.createDeviceRegistry(createRegistryRequest);
  console.log(`Created registry: ${registryName}`);
});

after(async () => {
  await pubSubClient.topic(topicName).delete();
  console.log(`Topic ${topicName} deleted.`);

  // Cleans up the registry by removing all associations and deleting all devices.
  childProcess.execSync(`${cmd} unbindAllDevices ${registryName}`, {
    cwd: cwd,
    shell: true,
  });
  childProcess.execSync(`${cmd} clearRegistry ${registryName}`, {
    cwd: cwd,
    shell: true,
  });

  console.log('Deleted test registry.');
});

it('should create and delete an unauthorized device', () => {
  const localDevice = 'test-device-unauth-delete';

  let output = childProcess.execSync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should list configs for a device', () => {
  const localDevice = 'test-device-configs';
  let output = childProcess.execSync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(
    `${cmd} getDeviceConfigs ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Configs'));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and delete an RSA256 device', () => {
  const localDevice = 'test-rsa-device';
  let output = childProcess.execSync(
    `${cmd} createRsa256Device ${localDevice} ${registryName} ${rsaPublicCert}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(
    `${cmd} getDeviceState ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('State'));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and delete an ES256 device', () => {
  const localDevice = 'test-es256-device';
  let output = childProcess.execSync(
    `${cmd} createEs256Device ${localDevice} ${registryName} ${ecPublicKey}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(
    `${cmd} getDeviceState ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('State'));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should patch an unauthorized device with RSA256', () => {
  const localDevice = 'test-device-patch-rs256';
  let output = childProcess.execSync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(
    `${cmd} patchRsa256 ${localDevice} ${registryName} ${rsaPublicCert}`,
    cwd
  );
  assert.ok(output.includes('Patched device:'));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should patch an unauthorized device with ES256', () => {
  const localDevice = 'test-device-patch-es256';
  let output = childProcess.execSync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(
    `${cmd} patchEs256 ${localDevice} ${registryName} ${ecPublicKey}`,
    cwd
  );
  assert.ok(output.includes('Patched device:'));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and list devices', () => {
  const localDevice = 'test-device-list';
  let output = childProcess.execSync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(`${cmd} listDevices ${registryName}`, cwd);
  assert.ok(output.includes('Current devices in registry:'));
  assert.ok(output.includes(localDevice));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted device'));
});

it('should create and get a device', () => {
  const localDevice = 'test-device-get';

  let output = childProcess.execSync(
    `${cmd} createUnauthDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes('Created device'));
  output = childProcess.execSync(
    `${cmd} getDevice ${localDevice} ${registryName}`,
    cwd
  );
  assert.ok(output.includes(`Found device: ${localDevice}`));
  output = childProcess.execSync(
    `${cmd} deleteDevice ${localDevice} ${registryName}`,
    cwd
  );
});

it('should create and get an iam policy', () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = childProcess.execSync(
    `${cmd} setIamPolicy ${registryName} ${localMember} ${localRole}`,
    cwd
  );
  assert.ok(output.includes('ETAG'));

  output = childProcess.execSync(`${cmd} getIamPolicy ${registryName}`, cwd);
  assert.ok(output.includes('dpebot'));
});

it('should create and delete a registry', () => {
  const createRegistryId = `${registryName}-create`;

  let output = childProcess.execSync(`${cmd} setupIotTopic ${topicName}`, cwd);
  output = childProcess.execSync(
    `${cmd} createRegistry ${createRegistryId} ${topicName}`,
    cwd
  );
  assert.ok(output.includes('Successfully created registry'));
  output = childProcess.execSync(
    `${cmd} deleteRegistry ${createRegistryId}`,
    cwd
  );
  assert.ok(output.includes('Successfully deleted registry'));
});

it('should send command message to device', () => {
  const deviceId = 'test-device-command';
  const commandMessage = 'rotate:180_degrees';

  childProcess.execSync(
    `${cmd} createRsa256Device ${deviceId} ${registryName} ${rsaPublicCert}`,
    cwd
  );

  childProcess.exec(
    `node cloudiot_mqtt_example_nodejs.js mqttDeviceDemo --deviceId=${deviceId} --registryId=${registryName}\
  --privateKeyFile=${rsaPrivateKey} --algorithm=RS256 --numMessages=20 --mqttBridgePort=8883`,
    {cwd: path.join(__dirname, '../../mqtt_example'), shell: true}
  );

  const output = childProcess.execSync(
    `${cmd} sendCommand ${deviceId} ${registryName} ${commandMessage}`
  );
  console.log(output);
  assert.ok(output.includes('Sent command'));

  childProcess.execSync(`${cmd} deleteDevice ${deviceId} ${registryName}`, cwd);
});

it('should create a new gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  const gatewayOut = childProcess.execSync(
    `${cmd} createGateway --registryId=${registryName} --gatewayId=${gatewayId}\
  --format=RSA_X509_PEM --key=${rsaPublicCert}`
  );

  // test no error on create gateway.
  assert.ok(gatewayOut.includes('Created device'));

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });
});

it('should list gateways', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  childProcess.execSync(
    `${cmd} createGateway --registryId=${registryName} --gatewayId=${gatewayId}\
  --format=RSA_X509_PEM --key=${rsaPublicCert}`
  );

  // look for output in list gateway
  const gateways = childProcess.execSync(`${cmd} listGateways ${registryName}`);
  assert.ok(gateways.includes(`${gatewayId}`));

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });
});

it('should bind existing device to gateway', async () => {
  const gatewayId = `nodejs-test-gateway-iot-${uuid.v4()}`;
  childProcess.execSync(
    `${cmd} createGateway --registryId=${registryName} --gatewayId=${gatewayId}\
  --format=RSA_X509_PEM --key=${rsaPublicCert}`
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
  const bind = childProcess.execSync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  assert.ok(bind.includes(`Binding device: ${deviceId}`));
  assert.strictEqual(bind.includes('Could not bind device'), false);

  // test unbind
  const unbind = childProcess.execSync(
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
  childProcess.execSync(
    `${cmd} createGateway --registryId=${registryName} --gatewayId=${gatewayId}\
  --format=RSA_X509_PEM --key=${rsaPublicCert}`
  );

  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await iotClient.createDevice({
    parent: iotClient.registryPath(projectId, region, registryName),
    device: {
      id: deviceId,
    },
  });

  childProcess.execSync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  const devices = childProcess.execSync(
    `${cmd} listDevicesForGateway ${registryName} ${gatewayId}`
  );

  assert.ok(devices.includes(deviceId));
  assert.strictEqual(
    devices.includes('No devices bound to this gateway.'),
    false
  );

  // cleanup
  childProcess.execSync(
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
  childProcess.execSync(
    `${cmd} createGateway --registryId=${registryName} --gatewayId=${gatewayId}\
  --format=RSA_X509_PEM --key=${rsaPublicCert}`
  );

  // create device
  const deviceId = `nodejs-test-device-iot-${uuid.v4()}`;
  await iotClient.createDevice({
    parent: iotClient.registryPath(projectId, region, registryName),
    device: {
      id: deviceId,
    },
  });

  childProcess.execSync(
    `${cmd} bindDeviceToGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  const devices = childProcess.execSync(
    `${cmd} listGatewaysForDevice ${registryName} ${deviceId}`
  );

  assert.ok(devices.includes(gatewayId));
  assert.strictEqual(
    devices.includes('No gateways associated with this device'),
    false
  );

  // cleanup
  childProcess.execSync(
    `${cmd} unbindDeviceFromGateway ${registryName} ${gatewayId} ${deviceId}`
  );

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, gatewayId),
  });

  await iotClient.deleteDevice({
    name: iotClient.devicePath(projectId, region, registryName, deviceId),
  });
});
