// Copyright 2020 Google LLC
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

const {SecurityCenterClient} = require('@google-cloud/security-center');
const uuidv1 = require('uuid').v1;
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

// TODO(developers): update for your own environment
const organizationId = '1081635000895';
const orgName = 'organizations/' + organizationId;
const pubsubTopic = 'projects/project-a-id/topics/notifications-sample-topic';

async function waitForConfig(client, configId) {
  const maxRetries = 10;
  const retryDelay = 1000; // 1 second
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const name = client.organizationNotificationConfigPath(
        organizationId,
        configId
      );
      const [config] = await client.getNotificationConfig({name});
      if (config) return;
    } catch (err) {
      // Ignore "not found" errors
      if (err.code !== 404) throw err;
    }
    retries++;
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }

  throw new Error(`Timeout waiting for config ${configId} to be available`);
}

describe('Client with Notifications', async () => {
  const createConfig = 'notif-config-test-node-create' + uuidv1();
  const deleteConfig = 'notif-config-test-node-delete' + uuidv1();
  const getConfig = 'notif-config-test-node-get' + uuidv1();
  const listConfig = 'notif-config-test-node-list' + uuidv1();
  const updateConfig = 'notif-config-test-node-update' + uuidv1();

  before(async () => {
    const client = new SecurityCenterClient();
    async function createNotificationConfig(configId) {
      try {
        /*eslint no-unused-vars: ["error", { "varsIgnorePattern": "^_" }]*/
        const [_response] = await client.createNotificationConfig({
          parent: orgName,
          configId: configId,
          notificationConfig: {
            description: 'Sample config for node.js',
            pubsubTopic: pubsubTopic,
            streamingConfig: {filter: 'state = "ACTIVE"'},
          },
        });
      } catch (err) {
        if (err.code === 400) {
          console.error(`Invalid input for config ${configId}:`, err.message);
        } else if (err.code === 503) {
          console.error(
            `Service unavailable when creating config ${configId}:`,
            err.message
          );
        } else {
          console.error(
            `Unexpected error creating config ${configId}:`,
            err.message
          );
        }
      }
    }

    await createNotificationConfig(deleteConfig);
    await waitForConfig(client, deleteConfig);
    await createNotificationConfig(getConfig);
    await waitForConfig(client, getConfig);
    await createNotificationConfig(listConfig);
    await waitForConfig(client, listConfig);
    await createNotificationConfig(updateConfig);
    await waitForConfig(client, updateConfig);
  });

  after(async () => {
    const client = new SecurityCenterClient();
    async function deleteNotificationConfigIfExists(configId) {
      const name = client.organizationNotificationConfigPath(
        organizationId,
        configId
      );
      try {
        // Check if the config exists
        const [config] = await client.getNotificationConfig({name});
        if (config) {
          // Proceed with deletion if the config exists
          await client.deleteNotificationConfig({name: name});
          console.log(`Config ${configId} deleted successfully.`);
        }
      } catch (err) {
        if (err.code === 404) {
          console.warn(`Config ${configId} not found during deletion.`);
        } else if (err.code === 503) {
          console.error(
            `Service unavailable when deleting config ${configId}:`,
            err.message
          );
        } else {
          console.error(
            `Unexpected error deleting config ${configId}:`,
            err.message
          );
        }
      }
    }

    await deleteNotificationConfigIfExists(createConfig);
    await deleteNotificationConfigIfExists(getConfig);
    await deleteNotificationConfigIfExists(listConfig);
    await deleteNotificationConfigIfExists(updateConfig);
  });

  it('client can create config', () => {
    const output = exec(
      `node v1/createNotificationConfig.js ${organizationId} ${createConfig} ${pubsubTopic}`
    );
    assert.include(output, createConfig);
    assert.match(output, /Notification config creation succeeded/);
    assert.notMatch(output, /undefined/);
  });

  it('client can delete config', () => {
    const output = exec(
      `node v1/deleteNotificationConfig.js ${organizationId} ${deleteConfig}`
    );
    assert.include(output, 'Notification config deleted');
    assert.notMatch(output, /undefined/);
  });

  it('client can get config', () => {
    const output = exec(
      `node v1/getNotificationConfig.js ${organizationId} ${getConfig}`
    );
    assert.include(output, getConfig);
    assert.match(output, /Notification config/);
    assert.notMatch(output, /undefined/);
  });

  it('client can list configs', () => {
    const output = exec(`node v1/listNotificationConfigs.js ${organizationId}`);
    assert.include(output, listConfig);
    assert.match(output, /Received Notification configs/);
    assert.notMatch(output, /undefined/);
  });

  it('client can update configs', () => {
    const output = exec(
      `node v1/updateNotificationConfig.js ${organizationId} ${updateConfig} ${pubsubTopic}`
    );
    assert.include(output, updateConfig);
    assert.match(output, /notification config update succeeded/);
    assert.notMatch(output, /undefined/);
  });
});
