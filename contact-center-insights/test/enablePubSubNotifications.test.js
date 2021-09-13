// Copyright 2021 Google LLC
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
//

'use strict';

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const generateUuid = () => `${uuid.v4()}`.replace(/-/gi, '_');

const {
  ContactCenterInsightsClient,
} = require('@google-cloud/contact-center-insights');
const client = new ContactCenterInsightsClient();

const {PubSub} = require('@google-cloud/pubsub');
const pubSub = new PubSub();

const conversationTopicId = `create-conversation-${generateUuid()}`;
const analysisTopicId = `create-analysis-${generateUuid()}`;

describe('EnablePubSubNotifications', () => {
  let projectId;
  let conversationTopic;
  let analysisTopic;

  before(async () => {
    projectId = await client.getProjectId();
    conversationTopic = `projects/${projectId}/topics/${conversationTopicId}`;
    analysisTopic = `projects/${projectId}/topics/${analysisTopicId}`;

    // Creates Pub/Sub topics.
    await pubSub.createTopic(conversationTopic);
    await pubSub.createTopic(analysisTopic);
  });

  after(async () => {
    // Disables Pub/Sub notifications.
    await client.updateSettings({
      settings: {
        name: client.settingsPath(projectId, 'us-central1'),
        pubsubNotificationSettings: {},
      },
      updateMask: {
        paths: ['pubsub_notification_settings'],
      },
    });

    // Deletes Pub/Sub topics.
    await pubSub.topic(conversationTopic).delete();
    await pubSub.topic(analysisTopic).delete();
  });

  it('should enable Pub/Sub notifications', async () => {
    const stdout = execSync(`node ./enablePubSubNotifications.js \
                             ${projectId} ${conversationTopic} ${analysisTopic}`);
    assert.match(stdout, new RegExp('Enabled Pub/Sub notifications'));
  });
});
