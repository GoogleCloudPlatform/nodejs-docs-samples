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

const client = require(`@google-cloud/monitoring`).uptimeCheck();
const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node uptime.js`;
const cwd = path.join(__dirname, `..`);
const projectId = process.env.GCLOUD_PROJECT;
const instanceId = 'uptime-test-' + Date.now();

test.before(tools.checkCredentials);

test(`should get an uptime check`, async (t) => {
  t.regex(await tools.runAsync(`${cmd} list-ips`, cwd), /USA/);
});

let id;

test.serial(`should create an uptime check`, async (t) => {
  const results = await tools.runAsyncWithIO(`${cmd} create ${instanceId}`, cwd);
  const output = results.stdout + results.stderr;
  const matches = output.match(new RegExp(`ID: projects/${projectId}/uptimeCheckConfigs/(.+)`));
  id = matches[1];
  t.regex(output, /Uptime check created:/);
  t.regex(output, new RegExp(`Resource: {"type":"gce_instance","labels":{"instance_id":"${instanceId}"}}`));
  t.regex(output, /Display Name: My GCE Instance Uptime Check/);
});

test.serial(`should get an uptime check`, async (t) => {
  const results = await tools.runAsyncWithIO(`${cmd} get ${id}`, cwd);
  const output = results.stdout + results.stderr;
  t.regex(output, new RegExp(`Retrieving projects/${projectId}/uptimeCheckConfigs/${id}`));
  t.regex(output, new RegExp(`Resource: {"type":"gce_instance","labels":{"instance_id":"${instanceId}"}}`));
});

test.serial(`should list uptime checks`, async (t) => {
  t.plan(0);
  await tools.tryTest(async (assert) => {
    const results = await tools.runAsyncWithIO(`${cmd} list`, cwd);
    const output = results.stdout + results.stderr;
    assert((new RegExp(`Resource: {"type":"gce_instance","labels":{"instance_id":"${instanceId}"}}`)).test(output));
    assert(/Display Name: My GCE Instance Uptime Check/.test(output));
  }).start();
});

test.serial(`should delete an uptime check`, async (t) => {
  const results = await tools.runAsyncWithIO(`${cmd} delete ${id}`, cwd);
  const output = results.stdout + results.stderr;
  t.regex(output, new RegExp(`Deleting projects/${projectId}/uptimeCheckConfigs/${id}`));
  t.regex(output, new RegExp(`projects/${projectId}/uptimeCheckConfigs/${id} deleted.`));
});

