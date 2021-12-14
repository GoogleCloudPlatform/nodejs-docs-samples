// Copyright 2021 Google LLC
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

const compute = require('@google-cloud/compute');

const {describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const {assert} = require('chai');

const instancesClient = new compute.InstancesClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const getInstance = async (projectId, zone, instanceName) => {
  const [instance] = await instancesClient.get({
    project: projectId,
    zone,
    instance: instanceName,
  });
  return instance;
};

describe('Instance with a custom hostname samples', () => {
  const instanceName = `gcloud-test-instance-${uuid.v4().split('-')[0]}`;
  const zone = 'europe-central2-b';
  const custom_hostname = 'host.domain.com';

  it('should create instance with a custom hostname and return correct hostname', async () => {
    const projectId = await instancesClient.getProjectId();
    let output = execSync(
      `node custom-hostname-instance/createInstanceWithCustomHostname ${projectId} ${zone} ${instanceName} ${custom_hostname}`
    );

    const instance = await getInstance(projectId, zone, instanceName);

    assert.equal(instance.hostname, custom_hostname);
    assert.match(output, /Instance created./);

    output = execSync(
      `node custom-hostname-instance/getInstanceHostname ${projectId} ${zone} ${instanceName}`
    );

    assert.include(
      output,
      `Instance ${instanceName} has hostname: ${custom_hostname}`
    );

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });

  it('should return undefined if hostname is not set', async () => {
    const projectId = await instancesClient.getProjectId();

    execSync(`node createInstance ${projectId} ${zone} ${instanceName}`);
    const output = execSync(
      `node custom-hostname-instance/getInstanceHostname ${projectId} ${zone} ${instanceName}`
    );

    assert.include(output, `Instance ${instanceName} has hostname: undefined`);

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
