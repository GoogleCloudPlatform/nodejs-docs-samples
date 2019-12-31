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

const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node uptime.js';
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

describe('uptime', () => {
  it('should list uptime-check ips', async () => {
    const output = execSync(`${cmd} list-ips`);
    assert.match(output, /USA/);
  });

  let id;

  it('should create an uptime check', async () => {
    const output = execSync(`${cmd} create ${hostname}`);
    const matches = output.match(
      new RegExp(`ID: projects/${projectId}/uptimeCheckConfigs/(.+)`)
    );
    id = matches[1];
    assert.match(output, /Uptime check created:/);
    const resources = getResourceObjects(output);
    assert.include(resources[0]['type'], 'uptime_url');
    assert.include(resources[0]['labels']['host'], hostname);
    assert.match(output, /Display Name: My Uptime Check/);
  });

  it('should get an uptime check', async () => {
    const output = execSync(`${cmd} get ${id}`);
    assert.match(
      output,
      new RegExp(`Retrieving projects/${projectId}/uptimeCheckConfigs/${id}`)
    );
    const resources = getResourceObjects(output);
    assert.include(resources[0]['type'], 'uptime_url');
    assert.include(resources[0]['labels']['host'], hostname);
  });

  it('should list uptime checks', async () => {
    const output = execSync(`${cmd} list`);
    const resources = getResourceObjects(output);
    const resourceCount = resources.filter(
      resource =>
        resource['type'] === 'uptime_url' &&
        resource['labels']['host'] === hostname
    ).length;
    assert.isAbove(resourceCount, 0);
    assert.match(output, /Display Name: My Uptime Check/);
  });

  it('should update an uptime check', async () => {
    const newDisplayName = 'My New Display';
    const path = '/';
    const output = execSync(`${cmd} update ${id} "${newDisplayName}" ${path}`);
    assert.include(
      output,
      `Updating projects/${projectId}/uptimeCheckConfigs/${id} to ${newDisplayName}`
    );
    assert.include(
      output,
      `projects/${projectId}/uptimeCheckConfigs/${id} config updated.`
    );
  });

  it('should delete an uptime check', async () => {
    const output = execSync(`${cmd} delete ${id}`);
    assert.include(
      output,
      `Deleting projects/${projectId}/uptimeCheckConfigs/${id}`
    );
    assert.include(
      output,
      `projects/${projectId}/uptimeCheckConfigs/${id} deleted.`
    );
  });
});
