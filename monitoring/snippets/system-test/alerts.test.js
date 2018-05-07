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
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const client = new monitoring.AlertPolicyServiceClient();
const channelClient = new monitoring.NotificationChannelServiceClient();
const cwd = path.join(__dirname, `..`);
const projectId = process.env.GCLOUD_PROJECT;

let policyOneName, policyTwoName, channelName;

test.before(tools.checkCredentials);

test.before(async () => {
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
            filter: `metric.type = "cloudfunctions.googleapis.com/function/execution_count"`,
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
              seconds: 60,
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
            filter: `metric.type = "cloudfunctions.googleapis.com/function/execution_count"`,
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
              seconds: 60,
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
});

function deletePolicies() {
  return Promise.all([
    client.deleteAlertPolicy({
      name: policyOneName,
    }),
    client.deleteAlertPolicy({
      name: policyTwoName,
    }),
  ]);
}

function deleteChannels() {
  return Promise.all([
    channelClient.deleteNotificationChannel({
      name: channelName,
    }),
  ]);
}

test.after.always(async () => {
  await deletePolicies();
  // has to be done after policies are deleted
  await deleteChannels();
});

test.serial(`should replace notification channels`, async t => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `replace`, policyOneName, channelName],
    cwd
  );
  t.regex(results.output, /Updated projects\//);
  t.true(results.output.includes(policyOneName));
});

test.serial(`should disable policies`, async t => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `disable`, projectId, `'display_name.size < 7'`],
    cwd
  );
  t.regex(results.output, /Disabled projects\//);
  t.false(results.output.includes(policyOneName));
  t.true(results.output.includes(policyTwoName));
});

test.serial(`should enable policies`, async t => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `enable`, projectId, `'display_name.size < 7'`],
    cwd
  );
  t.regex(results.output, /Enabled projects\//);
  t.false(results.output.includes(policyOneName));
  t.true(results.output.includes(policyTwoName));
});

test.serial(`should list policies`, async t => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `list`, projectId],
    cwd
  );
  t.regex(results.output, /Policies:/);
  t.true(results.output.includes('first_policy'));
  t.true(results.output.includes('Test'));
  t.true(results.output.includes('second'));
});

test.serial(`should backup all policies`, async t => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `backup`, projectId],
    cwd
  );
  t.regex(results.output, /Saved policies to \.\/policies_backup.json/);
  t.true(fs.existsSync(path.join(cwd, `policies_backup.json`)));
  await client.deleteAlertPolicy({name: policyOneName});
});

test.serial(`should restore policies`, async t => {
  const results = await tools.spawnAsyncWithIO(
    `node`,
    [`alerts.js`, `restore`, projectId],
    cwd
  );
  t.regex(results.output, /Loading policies from .\/policies_backup.json/);
  const nameRegexp = /projects\/[A-Za-z0-9-]+\/alertPolicies\/([\d]+)/gi;
  const matches = results.output.match(nameRegexp);
  t.true(Array.isArray(matches));
  t.is(matches.length, 2);
  policyOneName = matches[0];
  policyTwoName = matches[1];
});
