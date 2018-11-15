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
// TODO: update manager paths when going from beta->GA
const cwdHelper = path.join(__dirname, `../../../manager`);
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

test(`should receive command message`, async t => {
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

  // This command needs to run asynchronously without await to ensure the send comand happens while
  // mqtt client is available. Limit client to last only 15 seconds (0.25 minutes)
  let out = tools.runAsync(
    `${receiveCmd} --deviceId=${localDevice} --registryId=${localRegName} --maxDuration=0.25 ${receiveCmdSuffix}`
  );

  await tools.runAsync(
    `${sendCmd} sendCommand ${localDevice} ${localRegName} "me want cookies"`,
    cwdSend
  );

  // await for original command to resolve before checking regex
  t.regex(await out, new RegExp(`me want cookies`));

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
