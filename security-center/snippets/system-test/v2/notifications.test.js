/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const {SecurityCenterClient} = require('@google-cloud/security-center').v2;
const uuidv1 = require('uuid').v1;
const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

const organizationId = process.env['GCLOUD_ORGANIZATION'];
const projectId = process.env['GOOGLE_PROJECT_ID'];
const location = 'global';

describe('Client with Notifications v2', async () => {
  let data;
  before(async () => {
    const client = new SecurityCenterClient();
    const configId = 'notif-config-test-node-create-' + uuidv1();
    const topicName = 'test_topic';
    const parent = `projects/${projectId}/locations/${location}`;
    const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

    const notificationConfig = {
      description: 'Sample config for node v2',
      pubsubTopic: pubsubTopic,
      streamingConfig: {filter: 'state = "ACTIVE"'},
    };

    const [notificationResponse] = await client.createNotificationConfig({
      parent: parent,
      configId: configId,
      notificationConfig: notificationConfig,
    });

    const notificationConfigs = notificationResponse.name.split('/')[5];
    data = {
      orgId: organizationId,
      projectId: projectId,
      notificationName: notificationResponse.name,
      notificationConfigs: notificationConfigs,
      topicName: topicName,
    };
    console.log('my data notification %j', data);
  });
  it('client can create config v2', () => {
    const output = exec(
      `node v2/createNotificationConfig.js ${data.projectId} ${data.topicName}`
    );
    assert.match(output, new RegExp(data.projectId));
    assert.match(output, /Notification configuration creation successful/);
    assert.notMatch(output, /undefined/);
  });

  it('client can get config v2', () => {
    const output = exec(
      `node v2/getNotificationConfig.js ${data.projectId} ${data.notificationConfigs}`
    );
    assert.match(output, new RegExp(data.notificationName));
    assert.match(output, /Notification config/);
    assert.notMatch(output, /undefined/);
  });

  it('client can list configs v2', () => {
    const output = exec(`node v2/listNotificationConfigs.js ${data.projectId}`);
    assert.match(output, new RegExp(data.projectId));
    assert.notMatch(output, /undefined/);
  });

  it('client can update configs v2', () => {
    const output = exec(
      `node v2/updateNotificationConfig.js ${data.projectId} ${data.notificationConfigs} ${data.topicName}`
    );
    assert.match(output, new RegExp(data.notificationName));
    assert.match(output, /Notification configuration update successful/);
    assert.notMatch(output, /undefined/);
  });

  it('client can delete config v2', () => {
    const output = exec(
      `node v2/deleteNotificationConfig.js ${data.projectId} ${data.notificationConfigs}`
    );
    assert.include(output, 'Deleted Notification config');
    assert.notMatch(output, /undefined/);
  });
});
