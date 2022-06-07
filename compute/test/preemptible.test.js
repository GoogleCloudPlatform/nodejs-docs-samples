// Copyright 2022 Google LLC
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
const cp = require('child_process');
const {assert} = require('chai');

const {generateTestId, getStaleVMInstances, deleteInstance} = require('./util');

const instancesClient = new compute.InstancesClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('preemptible instances tests', () => {
  const instanceName = generateTestId();
  const zone = 'europe-central2-b';

  before(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('create and print preemptible instance', async () => {
    const projectId = await instancesClient.getProjectId();

    let output;

    output = execSync(
      `node instances/preemptible/createPreemptible ${projectId} ${zone} ${instanceName}`
    );
    assert.match(output, /Instance created./);

    output = execSync(
      `node instances/preemptible/printPreemptible ${projectId} ${zone} ${instanceName}`
    );
    assert.include(output, 'Is instance preemptible: true');

    const filter = `'targetLink="https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instances/${instanceName}"'`;

    output = execSync(
      `node instances/preemptible/preemptionHistory ${projectId} ${zone} ${instanceName} ${filter}`
    );

    assert.include(output, `- ${instanceName}`);

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
