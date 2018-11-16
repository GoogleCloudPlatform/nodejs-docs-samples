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

const path = require(`path`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node uptime.js`;
const cwd = path.join(__dirname, `..`);
const projectId = process.env.GCLOUD_PROJECT;
const hostname = 'mydomain.com';

function getResourceObjects(output) {
  const regex = new RegExp(/^\s*Resource: (.*)$/gm);
  const result = [];
  let match;
  while ((match = regex.exec(output)) !== null) {
    result.push(JSON.parse(match[1]));
  }
  return result;
}

before(tools.checkCredentials);

it(`should list uptime-check ips`, async () => {
  assert.strictEqual(
    (await tools.runAsync(`${cmd} list-ips`, cwd)).includes('USA'),
    true
  );
});

let id;

it(`should create an uptime check`, async () => {
  const results = await tools.runAsyncWithIO(`${cmd} create ${hostname}`, cwd);
  const output = results.stdout + results.stderr;
  const matches = output.match(
    new RegExp(`ID: projects/${projectId}/uptimeCheckConfigs/(.+)`)
  );
  id = matches[1];
  assert.strictEqual(output.includes('Uptime check created:'), true);
  const resources = getResourceObjects(output);
  assert.strictEqual(resources[0]['type'], 'uptime_url');
  assert.strictEqual(resources[0]['labels']['host'], hostname);
  assert.strictEqual(output.includes('Display Name: My Uptime Check'), true);
});

it(`should get an uptime check`, async () => {
  const results = await tools.runAsyncWithIO(`${cmd} get ${id}`, cwd);
  const output = results.stdout + results.stderr;
  assert.strictEqual(
    new RegExp(
      `Retrieving projects/${projectId}/uptimeCheckConfigs/${id}`
    ).test(output),
    true
  );
  const resources = getResourceObjects(output);
  assert.strictEqual(resources[0]['type'], 'uptime_url');
  assert.strictEqual(resources[0]['labels']['host'], hostname);
});

it(`should list uptime checks`, async () => {
  await tools
    .tryTest(async assert => {
      const results = await tools.runAsyncWithIO(`${cmd} list`, cwd);
      const output = results.stdout + results.stderr;
      const resources = getResourceObjects(output);
      assert(
        resources.filter(
          resource =>
            resource['type'] === 'uptime_url' &&
            resource['labels']['host'] === hostname
        ).length > 0
      );
      assert(/Display Name: My Uptime Check/.test(output));
    })
    .start();
});

it(`should update an uptime check`, async () => {
  const newDisplayName = 'My New Display';
  const path = '/';
  const results = await tools.runAsyncWithIO(
    `${cmd} update ${id} "${newDisplayName}" ${path}`,
    cwd
  );
  const output = results.stdout + results.stderr;
  assert.strictEqual(
    new RegExp(
      `Updating projects/${projectId}/uptimeCheckConfigs/${id} to ${newDisplayName}`
    ).test(output),
    true
  );
  assert.strictEqual(
    new RegExp(
      `projects/${projectId}/uptimeCheckConfigs/${id} config updated.`
    ).test(output),
    true
  );
});

it(`should delete an uptime check`, async () => {
  const results = await tools.runAsyncWithIO(`${cmd} delete ${id}`, cwd);
  const output = results.stdout + results.stderr;
  assert.strictEqual(
    new RegExp(`Deleting projects/${projectId}/uptimeCheckConfigs/${id}`).test(
      output
    ),
    true
  );
  assert.strictEqual(
    new RegExp(`projects/${projectId}/uptimeCheckConfigs/${id} deleted.`).test(
      output
    ),
    true
  );
});
