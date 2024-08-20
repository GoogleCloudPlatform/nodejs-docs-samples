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

const getInstance = async (projectId, zone, instanceName) => {
  const [instance] = await instancesClient.get({
    project: projectId,
    zone,
    instance: instanceName,
  });
  return instance;
};

describe('custom machine type tests', () => {
  const instanceName = generateTestId();
  const zone = 'europe-central2-b';
  let projectId;

  describe('CustomMachineType class tests', () => {
    it('should create correct CustomMachineType class', async () => {
      const testData = [
        {
          cpuSeries: 'custom',
          memory: 8192,
          cpu: 8,
          out: 'URI: zones/europe-central2-b/machineTypes/custom-8-8192',
          outMt: 'MachineType: custom-8-8192',
        },
        {
          cpuSeries: 'n2-custom',
          memory: 4096,
          cpu: 4,
          out: 'URI: zones/europe-central2-b/machineTypes/n2-custom-4-4096',
          outMt: 'MachineType: n2-custom-4-4096',
        },
        {
          cpuSeries: 'n2d-custom',
          memory: 8192,
          cpu: 4,
          out: 'URI: zones/europe-central2-b/machineTypes/n2d-custom-4-8192',
          outMt: 'MachineType: n2d-custom-4-8192',
        },
        {
          cpuSeries: 'e2-custom',
          memory: 8192,
          cpu: 8,
          out: 'URI: zones/europe-central2-b/machineTypes/e2-custom-8-8192',
          outMt: 'MachineType: e2-custom-8-8192',
        },
        {
          cpuSeries: 'e2-custom-small',
          memory: 4096,
          cpu: 0,
          out: 'URI: zones/europe-central2-b/machineTypes/e2-custom-small-4096',
          outMt: 'MachineType: e2-custom-small-4096',
        },
        {
          cpuSeries: 'e2-custom-micro',
          memory: 2048,
          cpu: 0,
          out: 'URI: zones/europe-central2-b/machineTypes/e2-custom-micro-2048',
          outMt: 'MachineType: e2-custom-micro-2048',
        },
        {
          cpuSeries: 'n2-custom',
          memory: 638720,
          cpu: 8,
          out: 'URI: zones/europe-central2-b/machineTypes/n2-custom-8-638720-ext',
          outMt: 'MachineType: n2-custom-8-638720-ext',
        },
      ];

      for (const test of testData) {
        const output = execSync(
          `node instances/custom-machine-type/helperClass ${zone} ${test.cpuSeries} ${test.cpu} ${test.memory}`
        );

        assert.include(output, test.out);
        assert.include(output, test.outMt);
      }
    });

    it('should throw an error if wrong memory provided to CustomMachineType class', async () => {
      try {
        execSync(
          `node instances/custom-machine-type/helperClass ${zone} custom 8194 8`
        );
      } catch (err) {
        assert.include(
          err.stderr.toString(),
          'Requested memory must be a multiple of 256 MB'
        );
      }
    });

    it('should throw an error if wrong cpu count provided to CustomMachineType class', async () => {
      try {
        execSync(
          `node instances/custom-machine-type/helperClass ${zone} n2-custom 8194 66`
        );
      } catch (err) {
        assert.include(
          err.stderr.toString(),
          'Invalid number of cores requested'
        );
      }
    });
  });

  // TODO: move tests to unit tests from integration tests or fix flakes.
  describe.skip('instances with custom machine type tests', () => {
    after(async () => {
      const instances = await getStaleVMInstances();
      await Promise.all(
        instances.map(instance =>
          deleteInstance(instance.zone, instance.instanceName)
        )
      );
    });

    afterEach(async () => {
      await deleteInstance(zone, instanceName);
    });

    beforeEach(async () => {
      projectId = await instancesClient.getProjectId();
    });

    it('should create instance with custom machine type with helper', async () => {
      const output = execSync(
        `node instances/custom-machine-type/createWithHelper ${projectId} ${zone} ${instanceName} e2-custom 4 8192`
      );
      assert.match(output, /Instance created./);

      const instance = await getInstance(projectId, zone, instanceName);
      assert.equal(
        instance.machineType,
        `https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/machineTypes/e2-custom-4-8192`
      );
    });

    it('should create instance with custom machine type without helper', async () => {
      const output = execSync(
        `node instances/custom-machine-type/createWithoutHelper ${projectId} ${zone} ${instanceName} e2-custom 4 8192`
      );
      assert.match(output, /Instance created./);

      const instance = await getInstance(projectId, zone, instanceName);
      assert.equal(
        instance.machineType,
        `https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/machineTypes/e2-custom-4-8192`
      );
    });

    it('should create instance with custom machine type with extra mem without helper', async () => {
      const output = execSync(
        `node instances/custom-machine-type/extraMemWithoutHelper ${projectId} ${zone} ${instanceName} custom 4 24320`
      );
      assert.match(output, /Instance created./);

      const instance = await getInstance(projectId, zone, instanceName);
      assert.equal(
        instance.machineType,
        `https://www.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/machineTypes/custom-4-24320-ext`
      );
    });
  });
});
