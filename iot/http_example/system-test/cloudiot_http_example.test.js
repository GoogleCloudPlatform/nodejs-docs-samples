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

const path = require('path');
const {PubSub} = require('@google-cloud/pubsub');
const assert = require('assert');
const uuid = require('uuid');
const childProcess = require('child_process');

const deviceId = 'test-node-device';
const topicName = `nodejs-docs-samples-test-iot-${uuid.v4()}`;
const registryName = `nodejs-test-registry-iot-${uuid.v4()}`;
const helper = 'node ../manager/manager.js';
const cmd = `node cloudiot_http_example.js --registryId="${registryName}" --deviceId="${deviceId}" `;
const cwd = path.join(__dirname, '..');
const installDeps = 'npm install';

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
  const pubsub = new PubSub();
  const [topic] = await pubsub.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);
});

after(async () => {
  const pubsub = new PubSub();
  const topic = pubsub.topic(topicName);
  await topic.delete();
  console.log(`Topic ${topic.name} deleted.`);
});

it('should receive configuration message', () => {
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
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`,
    {cwd, shell: true}
  );

  const output = childProcess.execSync(
    `${cmd} --messageType=events --numMessages=1 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256`,
    {cwd, shell: true}
  );

  assert.strictEqual(new RegExp(/Getting config/).test(output), true);

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

it('should send event message', async () => {
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
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`,
    {cwd, shell: true}
  );

  const output = childProcess.execSync(
    `${cmd} --messageType=events --numMessages=1 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256`,
    {cwd, shell: true}
  );

  assert.strictEqual(new RegExp(/Publishing message/).test(output), true);

  // Check / cleanup
  await childProcess.execSync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  await childProcess.execSync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  await childProcess.execSync(`${helper} deleteRegistry ${localRegName}`, {
    cwd,
    shell: true,
  });
});

it('should send state message', async () => {
  const localDevice = 'test-rsa-device';
  const localRegName = `${registryName}-rsa256`;
  await childProcess.execSync(`${helper} setupIotTopic ${topicName}`, {
    cwd,
    shell: true,
  });
  await childProcess.execSync(
    `${helper} createRegistry ${localRegName} ${topicName}`,
    {cwd, shell: true}
  );
  await childProcess.execSync(
    `${helper} createRsa256Device ${localDevice} ${localRegName} resources/rsa_cert.pem`,
    {cwd, shell: true}
  );

  const output = await childProcess.execSync(
    `${cmd} --messageType=state --numMessages=1 --privateKeyFile=resources/rsa_private.pem --algorithm=RS256`,
    {cwd, shell: true}
  );
  assert.strictEqual(new RegExp(/Publishing message/).test(output), true);

  // Check / cleanup
  await childProcess.execSync(
    `${helper} getDeviceState ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  await childProcess.execSync(
    `${helper} deleteDevice ${localDevice} ${localRegName}`,
    {cwd, shell: true}
  );
  await childProcess.execSync(`${helper} deleteRegistry ${localRegName}`, {
    cwd,
    shell: true,
  });
});
