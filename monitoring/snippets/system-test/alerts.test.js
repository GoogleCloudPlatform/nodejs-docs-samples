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

const fs = require(`fs`);
const monitoring = require(`@google-cloud/monitoring`);
const path = require(`path`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);

const client = new monitoring.AlertPolicyServiceClient();
const channelClient = new monitoring.NotificationChannelServiceClient();
const cwd = path.join(__dirname, `..`);
const projectId = process.env.GCLOUD_PROJECT;

let policyOneName, policyTwoName, channelName;

before(tools.checkCredentials);

before(async () => {
  try {
    tools.checkCredentials;
    let results = await client.createAlertPolicy({
      name: client.projectPath(projectId),
      alertPolicy: {
        displayName: 'first_policy',
        combiner: 1,
        documentation: {
          content: 'Test',
          mimeType: 'text/markdown',
        },
        conditions: [
          {
            displayName: 'Condition 1',
            conditionAbsent: {
              filter: `resource.type = "cloud_function" AND metric.type = "cloudfunctions.googleapis.com/function/execution_count"`,
              aggregations: [
                {
                  alignmentPeriod: {
                    seconds: 60,
                  },
                  perSeriesAligner: 1,
                  crossSeriesReducer: 0,
                },
              ],
              duration: {
                seconds: 120,
              },
              trigger: {
                count: 1,
              },
            },
          },
        ],
      },
    });
    policyOneName = results[0].name;
    results = await client.createAlertPolicy({
      name: client.projectPath(projectId),
      alertPolicy: {
        displayName: 'second',
        combiner: 1,
        conditions: [
          {
            displayName: 'Condition 2',
            conditionAbsent: {
              filter: `resource.type = "cloud_function" AND metric.type = "cloudfunctions.googleapis.com/function/execution_count"`,
              aggregations: [
                {
                  alignmentPeriod: {
                    seconds: 60,
                  },
                  perSeriesAligner: 1,
                  crossSeriesReducer: 0,
                },
              ],
              duration: {
                seconds: 120,
              },
              trigger: {
                count: 1,
              },
            },
          },
        ],
      },
    });
    policyTwoName = results[0].name;
    results = await channelClient.createNotificationChannel({
      name: channelClient.projectPath(projectId),
      notificationChannel: {
        displayName: 'Channel 1',
        type: 'email',
        labels: {
          email_address: 'test@test.com',
        },
      },
    });
    channelName = results[0].name;
  } catch (err) {} // ignore error
});

async function deletePolicies() {
  await client.deleteAlertPolicy({
    name: policyOneName,
  });
  await client.deleteAlertPolicy({
    name: policyTwoName,
  });
}

async function deleteChannels() {
  await channelClient.deleteNotificationChannel({
    name: channelName,
  });
}

after(async () => {
  await deletePolicies();
  // has to be done after policies are deleted
  await deleteChannels();
});

it(`should replace notification channels`, async () => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `replace`, policyOneName, channelName],
    cwd
  );
  assert.strictEqual(results.output.includes('Updated projects'), true);
  assert.strictEqual(results.output.includes(policyOneName), true);
});

it(`should disable policies`, async () => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `disable`, projectId, `'display_name.size < 7'`],
    cwd
  );
  assert.strictEqual(results.output.includes('Disabled projects'), true);
  assert.strictEqual(results.output.includes(policyOneName), false);
  assert.strictEqual(results.output.includes(policyTwoName), true);
});

it(`should enable policies`, async () => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `enable`, projectId, `'display_name.size < 7'`],
    cwd
  );
  assert.strictEqual(results.output.includes('Enabled projects'), true);
  assert.strictEqual(results.output.includes(policyOneName), false);
  assert.strictEqual(results.output.includes(policyTwoName), true);
});

it(`should list policies`, async () => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `list`, projectId],
    cwd
  );
  assert.strictEqual(results.output.includes('Policies:'), true);
  assert.strictEqual(results.output.includes('first_policy'), true);
  assert.strictEqual(results.output.includes('Test'), true);
  assert.strictEqual(results.output.includes('second'), true);
});

it(`should backup all policies`, async () => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `backup`, projectId],
    cwd
  );
  assert.strictEqual(
    results.output.includes('Saved policies to ./policies_backup.json'),
    true
  );
  assert.strictEqual(
    fs.existsSync(path.join(cwd, `policies_backup.json`)),
    true
  );
  await client.deleteAlertPolicy({name: policyOneName});
});

it(`should restore policies`, async () => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `restore`, projectId],
    cwd
  );
  assert.strictEqual(
    results.output.includes('Loading policies from ./policies_backup.json'),
    true
  );
  const nameRegexp = /projects\/[A-Za-z0-9-]+\/alertPolicies\/([\d]+)/gi;
  const matches = results.output.match(nameRegexp);
  assert.strictEqual(Array.isArray(matches), true);
  assert.strictEqual(matches.length, 2);
  policyOneName = matches[0];
  policyTwoName = matches[1];
});
