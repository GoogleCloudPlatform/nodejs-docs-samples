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
const imagesClient = new compute.ImagesClient();
const globalOperationsClient = new compute.GlobalOperationsClient();
const zoneOperationsClient = new compute.ZoneOperationsClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('create windows os image tests', () => {
  const instanceName = generateTestId();
  const diskName = generateTestId();
  const imageName = generateTestId();
  const zone = 'europe-central2-b';

  after(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should create windows os image', async () => {
    const projectId = await instancesClient.getProjectId();

    const [insertResponse] = await instancesClient.insert({
      instanceResource: {
        name: instanceName,
        disks: [
          {
            initializeParams: {
              diskName: diskName,
              diskSizeGb: '64',
              sourceImage:
                'projects/windows-cloud/global/images/windows-server-2022-dc-core-v20231011',
            },
            deviceName: diskName,
            autoDelete: true,
            boot: true,
            type: 'PERSISTENT',
          },
        ],
        machineType: `zones/${zone}/machineTypes/n1-standard-1`,
        networkInterfaces: [
          {
            name: 'global/networks/default',
          },
        ],
      },
      project: projectId,
      zone,
    });
    let operation = insertResponse.latestResponse;

    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    try {
      execSync(
        `node instances/windows/creatingWindowsOSImage ${projectId} ${zone} ${diskName} ${imageName}`
      );
    } catch (err) {
      assert.include(
        err.stderr.toString(),
        `Instance ${instanceName} should be stopped.`
      );
    }

    const outputCreate2 = execSync(
      `node instances/windows/creatingWindowsOSImage ${projectId} ${zone} ${diskName} ${imageName} eu true`
    );
    assert.match(outputCreate2, /Image created./);

    const [deleteResponse] = await imagesClient.delete({
      project: projectId,
      image: imageName,
    });
    operation = deleteResponse.latestResponse;

    while (operation.status !== 'DONE') {
      [operation] = await globalOperationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
