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
const PubSub = require(`@google-cloud/pubsub`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;
const localRegName = `${registryName}-rsa256`;
const localDevice = `test-device-rsa256`;

const helper = `node manager.js`;
const receiveCmd = `node receive.js`;
const sendCmd = `node send.js`;
const receiveCmdSuffix = `--privateKeyFile=resources/rsa_private.pem --algorithm=RS256`;
// TODO: update manager path when going from beta->GA
const cwdHelper = path.join(__dirname, `../../../manager`);
const cwdRcv = path.join(__dirname, `../receive`);
const cwdSend = path.join(__dirname, `../send`);
const installDeps = `npm install`;

const pubsub = PubSub();

test.before(tools.checkCredentials);
test.before(async () => {
  let pubsubRes = await pubsub.createTopic(topicName);
  const topic = pubsubRes[0];
  console.log(`Topic ${topic.name} created.`);
});

test.after.always(async () => {
  const topic = pubsub.topic(topicName);
  await topic.delete();
  console.log(`Topic ${topic.name} deleted.`);
});

test(`should send command message`, async t => {
  // Create topic, registry, and device
  await tools.runAsync(installDeps, cwdHelper);
  await tools.runAsync(`${helper} setupIotTopic ${topicName}`, cwdHelper);
  await tools.runAsync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} ./resources/rsa_cert.pem`,
    cwdHelper
  );

  // Let the client run asynchronously since we don't need to test the output here
  tools.runAsync(
    `${receiveCmd} --deviceId=${localDevice} --registryId=${localRegName} ${receiveCmdSuffix}`,
    cwdRcv
  );

  let out = await tools.runAsync(
    `${sendCmd} sendCommand ${localDevice} ${localRegName} "me want cookies"`,
    cwdSend
  );

  t.regex(out, new RegExp(`Success : OK`));

  await tools.runAsync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    cwdHelper
  );
  await tools.runAsync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    cwdHelper
  );
  await tools.runAsync(`${helper} deleteRegistry ${localRegName}`, cwdHelper);
});
