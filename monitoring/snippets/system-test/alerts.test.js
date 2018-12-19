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

const monitoring = require('@google-cloud/monitoring');
const {assert} = require('chai');
const execa = require('execa');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

const client = new monitoring.AlertPolicyServiceClient();
const channelClient = new monitoring.NotificationChannelServiceClient();
const projectId = process.env.GCLOUD_PROJECT;
const cmd = 'node alerts';
const exec = async cmd => (await execa.shell(cmd)).stdout;

let policyOneName, policyTwoName, channelName;
const testPrefix = `gcloud-test-${uuid.v4().split('-')[0]}`;

describe('alerts', () => {
  before(async () => {
    await reapPolicies();
    let results = await client.createAlertPolicy({
      name: client.projectPath(projectId),
      alertPolicy: {
        displayName: `${testPrefix}-first-policy`,
        combiner: 1,
        documentation: {
          content: 'Test',
          mimeType: 'text/markdown',
        },
        conditions: [
          {
            displayName: 'Condition 1',
            conditionAbsent: {
              filter:
                'resource.type = "cloud_function" AND metric.type = "cloudfunctions.googleapis.com/function/execution_count"',
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
        displayName: `${testPrefix}-second`,
        combiner: 1,
        conditions: [
          {
            displayName: 'Condition 2',
            conditionAbsent: {
              filter:
                'resource.type = "cloud_function" AND metric.type = "cloudfunctions.googleapis.com/function/execution_count"',
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
  });

  /**
   * Delete any policies created by a test that's older than 2 minutes.
   */
  async function reapPolicies() {
    const [policies] = await client.listAlertPolicies({
      name: client.projectPath(projectId),
    });
    const crustyPolicies = policies
      .filter(p => p.displayName.match(/^gcloud-test-/))
      .filter(p => {
        const minutesOld =
          (Date.now() - p.creationRecord.mutateTime.seconds * 1000) / 1000 / 60;
        return minutesOld > 2;
      });
    // This is serial on purpose.  When trying to delete all alert policies in
    // parallel, all of the promises return successful, but then only 2?
    // get deleted.  Super, super bizarre.
    // https://github.com/googleapis/nodejs-monitoring/issues/192
    for (const p of crustyPolicies) {
      console.log(`\tReaping ${p.name}...`);
      await client.deleteAlertPolicy({name: p.name});
    }
  }

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
      force: true,
    });
  }

  after(async () => {
    await deletePolicies();
    // has to be done after policies are deleted
    await deleteChannels();
  });

  it('should replace notification channels', async () => {
    const stdout = await exec(`${cmd} replace ${policyOneName} ${channelName}`);
    assert.match(stdout, /Updated projects/);
    assert.match(stdout, new RegExp(policyOneName));
  });

  it('should disable policies', async () => {
    const stdout = await exec(
      `${cmd} disable ${projectId} 'display_name.size < 28'`
    );
    assert.match(stdout, /Disabled projects/);
    assert.notMatch(stdout, new RegExp(policyOneName));
    assert.match(stdout, new RegExp(policyTwoName));
  });

  it('should enable policies', async () => {
    const stdout = await exec(
      `${cmd} enable ${projectId} 'display_name.size < 28'`
    );
    assert.match(stdout, /Enabled projects/);
    assert.notMatch(stdout, new RegExp(policyOneName));
    assert.match(stdout, new RegExp(policyTwoName));
  });

  it('should list policies', async () => {
    const stdout = await exec(`${cmd} list ${projectId}`);
    assert.match(stdout, /Policies:/);
    assert.match(stdout, /first-policy/);
    assert.match(stdout, /Test/);
    assert.match(stdout, /second/);
  });

  it('should backup all policies', async () => {
    const output = await exec(`${cmd} backup ${projectId}`);
    assert.match(output, /Saved policies to .\/policies_backup.json/);
    assert.ok(fs.existsSync(path.join(__dirname, '../policies_backup.json')));
    await client.deleteAlertPolicy({name: policyOneName});
  });

  it('should restore policies', async () => {
    const output = await exec(`${cmd} restore ${projectId}`);
    assert.match(output, /Loading policies from .\/policies_backup.json/);
    const matches = output.match(
      /projects\/[A-Za-z0-9-]+\/alertPolicies\/([\d]+)/gi
    );
    assert.ok(Array.isArray(matches));
    assert(matches.length > 1);
    policyOneName = matches[0];
    policyTwoName = matches[1];
  });
});
