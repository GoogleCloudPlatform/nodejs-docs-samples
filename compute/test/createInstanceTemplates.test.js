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
// See the License for the specific langgsuage governing permissions and
// limitations under the License.

'use strict';

const compute = require('@google-cloud/compute');

const {describe, it} = require('mocha');
const cp = require('child_process');
const {assert} = require('chai');

const {generateTestId, getStaleVMInstances, deleteInstance} = require('./util');

const instancesClient = new compute.InstancesClient();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const createInstance = async (projectId, zone, instanceName) => {
  const [response] = await instancesClient.insert({
    instanceResource: {
      name: instanceName,
      disks: [
        {
          initializeParams: {
            diskSizeGb: '250',
            sourceImage: 'projects/debian-cloud/global/images/family/debian-11',
          },
          autoDelete: true,
          boot: true,
          type: 'PERSISTENT',
          deviceName: 'disk-1',
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
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();

  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone: operation.zone.split('/').pop(),
    });
  }
};

describe('create instance templates tests', () => {
  const templateName = generateTestId();
  const zone = 'europe-central2-b';
  const instanceName = generateTestId();
  const networkName = 'global/networks/default-compute';
  const subnetworkName = 'regions/asia-east1/subnetworks/default-compute';

  after(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should create/get/list/delete instance templates', async () => {
    const projectId = await instancesClient.getProjectId();

    const outputCreate = execSync(
      `node create-instance-templates/createTemplate ${projectId} ${templateName}`
    );
    assert.match(outputCreate, /Instance template created./);

    const outputGet = execSync(
      `node create-instance-templates/getInstanceTemplate ${projectId} ${templateName}`
    );

    assert.include(outputGet, `name: '${templateName}'`);

    const outputList = execSync(
      `node create-instance-templates/listInstanceTemplates ${projectId} ${templateName}`
    );
    assert.include(outputList, `- ${templateName}`);

    const outputDelete = execSync(
      `node create-instance-templates/deleteInstanceTemplate ${projectId} ${templateName}`
    );
    assert.match(outputDelete, /Instance template deleted./);
  });

  it('should create template from instance', async () => {
    const projectId = await instancesClient.getProjectId();

    await createInstance(projectId, zone, instanceName);

    const formattedInstanceName = `projects/${projectId}/zones/${zone}/instances/${instanceName}`;
    const outputCreate = execSync(
      `node create-instance-templates/createTemplateFromInstance ${projectId} ${formattedInstanceName} ${templateName}`
    );
    assert.match(outputCreate, /Instance template created./);

    execSync(
      `node create-instance-templates/deleteInstanceTemplate ${projectId} ${templateName}`
    );
    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });

  it('should create template with subnet', async () => {
    const projectId = await instancesClient.getProjectId();

    await createInstance(projectId, zone, instanceName);

    const outputCreate = execSync(
      `node create-instance-templates/createTemplateWithSubnet ${projectId} ${networkName} ${subnetworkName} ${templateName}`
    );
    assert.match(outputCreate, /Instance template created./);

    execSync(
      `node create-instance-templates/deleteInstanceTemplate ${projectId} ${templateName}`
    );
    execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
  });
});
