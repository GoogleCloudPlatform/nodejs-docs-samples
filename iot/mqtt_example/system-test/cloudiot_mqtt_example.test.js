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
const path = require(`path`);
const {PubSub} = require(`@google-cloud/pubsub`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const projectId =
  process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
const topicName = `nodejs-iot-test-mqtt-topic`;
const registryName = `nodejs-iot-test-mqtt-registry`;
const region = `us-central1`;
const rsaPublicCert = process.env.NODEJS_IOT_RSA_PUBLIC_CERT;
const rsaPrivateKey = process.env.NODEJS_IOT_RSA_PRIVATE_KEY;

const helper = `node ../manager/manager.js`;
const cmd = `node cloudiot_mqtt_example_nodejs.js `;
const cmdSuffix = ` --numMessages=1 --privateKeyFile=${rsaPrivateKey} --algorithm=RS256`;
const cwd = path.join(__dirname, `..`);
const installDeps = `npm install`;

const iotClient = new iot.v1.DeviceManagerClient();
const pubSubClient = new PubSub({projectId});

test.todo(tools.run(installDeps, `${cwd}/../manager`));
test.before(tools.checkCredentials);
test.before(async () => {
  // Create a single topic to be used for testing.
  let createTopicRes = await pubSubClient.createTopic(topicName);
  let topic = createTopicRes[0];
  console.log(`Topic ${topic.name} created.`);

  // Cleans up and creates a single registry to be used for tests.
  tools.run(`${helper} unbindAllDevices ${registryName}`, cwd);
  tools.run(`${helper} clearRegistry ${registryName}`, cwd);

  console.log('Cleaned up existing registry.');
  let createRegistryRequest = {
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

test.after.always(async () => {
  await pubSubClient.topic(topicName).delete();
  console.log(`Topic ${topicName} deleted.`);

  const deleteRegistryRequest = {
    name: iotClient.registryPath(projectId, region, registryName),
  };

  await iotClient.deleteDeviceRegistry(deleteRegistryRequest).catch(err => {
    console.log(err);
  });
  console.log('Deleted test registry.');
});

test(`should receive configuration message`, async t => {
  const localDevice = `test-rsa-device`;
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

  t.regex(output, new RegExp('connect'));
  t.regex(output, new RegExp('Config message received:'));

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

test(`should send event message`, async t => {
  const localDevice = `test-rsa-device`;
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
  t.regex(output, new RegExp(`Publishing message:`));

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

test(`should send state message`, async t => {
  const localDevice = `test-rsa-device`;
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
  t.regex(output, new RegExp(`Publishing message:`));

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

test(`should receive command message`, async t => {
  const localDevice = `test-rsa-device`;
  const localRegName = `${registryName}-rsa256`;
  const message = 'rotate 180 degrees';

  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwd);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    cwd
  );
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} ${rsaPublicCert}`,
    cwd
  );

  let output = tools.runAsync(
    `${cmd} mqttDeviceDemo --registryId=${localRegName} --deviceId=${localDevice} --numMessages=30 --privateKeyFile=${rsaPrivateKey} --algorithm=RS256 --mqttBridgePort=443`,
    cwd
  );

  await tools.runAsync(
    `${helper} sendCommand ${localDevice} ${localRegName} "${message}"`,
    cwd
  );

  t.regex(await output, new RegExp(`Command message received: ${message}`));

  // Cleanup
  await tools.runAsync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    cwd
  );
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwd);
});

test(`should listen for bound device config message`, async t => {
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
  let out = await tools.runAsync(
    `${cmd} listenForConfigMessages --deviceId=${deviceId} --gatewayId=${gatewayId} --registryId=${registryName} --privateKeyFile=${rsaPrivateKey} --clientDuration=10000 --algorithm=RS256`
  );

  t.regex(out, new RegExp('message received'));

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

test(`should listen for error topic messages`, async t => {
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
  let out = await tools.runAsync(
    `${cmd} listenForErrorMessages --gatewayId=${gatewayId} --registryId=${registryName} --deviceId=${deviceId} --privateKeyFile=${rsaPrivateKey} --clientDuration=30000 --algorithm=RS256`
  );

  t.regex(
    out,
    new RegExp(`DeviceId ${deviceId} is not associated with Gateway`)
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

test(`should send data from bound device`, async t => {
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
  let out = await tools.runAsync(
    `${cmd} sendDataFromBoundDevice --deviceId=${deviceId} --gatewayId=${gatewayId} --registryId=${registryName} --privateKeyFile=${rsaPrivateKey} --numMessages=5 --algorithm=RS256`
  );

  t.regex(out, new RegExp('Publishing message 5/5'));
  t.notRegex(out, new RegExp('Error: Connection refused'));

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
