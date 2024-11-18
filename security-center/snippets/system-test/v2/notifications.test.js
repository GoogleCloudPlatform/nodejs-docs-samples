// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {execSync} = require('node:child_process');

const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const uuidv1 = require('uuid').v1;

const {SecurityCenterClient} = require('@google-cloud/security-center').v2;
const {PubSub} = require('@google-cloud/pubsub');

const exec = cmd => execSync(cmd, {encoding: 'utf8'});

// TODO(developers): update for your own environment
const organizationId = process.env.GCLOUD_ORGANIZATION;
const projectId = process.env.GOOGLE_SAMPLES_PROJECT;
const location = 'global';

describe('Client with Notifications v2', async () => {
  let client;
  let pubSubClient;
  let topicName;
  let parent;
  let pubsubTopic;

  let data;

  before(async () => {
    const configId = 'notif-config-test-node-create-' + uuidv1();
    topicName = 'notifications-sample-topic';
    parent = `projects/${projectId}/locations/${location}`;
    pubsubTopic = `projects/${projectId}/topics/${topicName}`;

    client = new SecurityCenterClient();

    pubSubClient = new PubSub();
    // A previous test failure can result the topic hanging around
    try {
      await pubSubClient.topic(topicName).delete();
    } catch {
      // Ignore if the topic doesn't already exist
    }
    await pubSubClient.createTopic(topicName);

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

  after(async () => {
    try {
      await pubSubClient.topic(topicName).delete();
    } catch {
      // Ignore if the topic doesn't exist
    }
  });

  it('client can create config v2', () => {
    const output = exec(
      `node v2/createNotificationConfig.js ${data.projectId} ${data.topicName}`
    );
    assert(output.includes(data.projectId));
    assert.match(output, /Notification configuration creation successful/);
    assert.notMatch(output, /undefined/);
  });

  it('client can get config v2', () => {
    const output = exec(
      `node v2/getNotificationConfig.js ${data.projectId} ${data.notificationConfigs}`
    );
    assert(output.includes(data.notificationName));
    assert.match(output, /Notification config/);
    assert.notMatch(output, /undefined/);
  });

  it('client can list configs v2', () => {
    const output = exec(`node v2/listNotificationConfigs.js ${data.projectId}`);
    assert(output.includes(data.projectId));
    assert.notMatch(output, /undefined/);
  });

  it('client can update configs v2', () => {
    const output = exec(
      `node v2/updateNotificationConfig.js ${data.projectId} ${data.notificationConfigs} ${data.topicName}`
    );
    assert(output.includes(data.notificationName));
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
