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

describe('prevent accidental vm deletion tests', () => {
  const instanceName = generateTestId();
  const zone = 'europe-central2-b';

  after(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should create instance and set delete protection', async () => {
    const projectId = await instancesClient.getProjectId();

    const outputCreate = execSync(
      `node instances/preventing-accidental-vm-deletion/createInstance ${projectId} ${zone} ${instanceName} true`
    );
    assert.match(outputCreate, /Instance created./);

    const outputGet = execSync(
      `node instances/preventing-accidental-vm-deletion/getDeleteProtection ${projectId} ${zone} ${instanceName}`
    );
    assert.include(
      outputGet,
      `Instance ${instanceName} has deletionProtection value: true`
    );

    const outputSet = execSync(
      `node instances/preventing-accidental-vm-deletion/setDeleteProtection ${projectId} ${zone} ${instanceName} false`
    );
    assert.include(outputSet, 'Instance updated.');

    const outputGet2 = execSync(
      `node instances/preventing-accidental-vm-deletion/getDeleteProtection ${projectId} ${zone} ${instanceName}`
    );
    assert.include(
      outputGet2,
      `Instance ${instanceName} has deletionProtection value: false`
    );

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
