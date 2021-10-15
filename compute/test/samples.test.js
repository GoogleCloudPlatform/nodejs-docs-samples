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
const computeProtos = compute.protos.google.cloud.compute.v1;
const {Storage} = require('@google-cloud/storage');

const {describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const {assert} = require('chai');

const instancesClient = new compute.InstancesClient({fallback: 'rest'});
const projectsClient = new compute.ProjectsClient({fallback: 'rest'});

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

// A helper for delaying integration tests with an exponential backoff.
// See examples like: https://github.com/googleapis/nodejs-monitoring/issues/190,
// https://github.com/googleapis/nodejs-monitoring/issues/191.
const delay = async test => {
  const retries = test.currentRetry();
  if (retries === 0) return; // no retry on the first failure.
  // see: https://cloud.google.com/storage/docs/exponential-backoff:
  const ms = Math.pow(2, retries) * 500 + Math.random() * 1000;
  return new Promise(done => {
    console.info(`retrying "${test.title}" in ${ms}ms`);
    setTimeout(done, ms);
  });
};

describe('samples', () => {
  const instanceName = `gcloud-test-intance-${uuid.v4().split('-')[0]}`;
  const zone = 'europe-central2-b';
  const bucketName = `test-bucket-name-${uuid.v4().split('-')[0]}`;

  const storage = new Storage();

  it('should create instance', async () => {
    const projectId = await instancesClient.getProjectId();
    const output = execSync(
      `node createInstance ${projectId} ${zone} ${instanceName}`
    );
    assert.match(output, /Instance created./);
  });

  it('should print instances list', async () => {
    const projectId = await instancesClient.getProjectId();
    const output = execSync(`node listInstances ${projectId} ${zone}`);
    assert.match(output, /Instances found in zone/);
  });

  it('should print all instances list', async () => {
    const projectId = await instancesClient.getProjectId();
    const output = execSync(`node listAllInstances ${projectId}`);
    assert.match(output, /Instances found:/);
  });

  it('should delete instance', async () => {
    const projectId = await instancesClient.getProjectId();
    const output = execSync(
      `node deleteInstance ${projectId} ${zone} ${instanceName}`
    );
    assert.match(output, /Instance deleted./);
  });

  it('should wait for operation', async () => {
    const projectId = await instancesClient.getProjectId();

    const newinstanceName = `gcloud-test-intance-${uuid.v4().split('-')[0]}`;

    execSync(`node createInstance ${projectId} ${zone} ${newinstanceName}`);

    const [response] = await instancesClient.delete({
      project: projectId,
      zone,
      instance: newinstanceName,
    });

    const operationString = JSON.stringify(response.latestResponse);

    const output = execSync(
      `node waitForOperation ${projectId} '${operationString}'`
    );
    assert.match(output, /Operation finished./);
  });

  describe('usage export', () => {
    before(async () => {
      try {
        await storage.createBucket(bucketName);
      } catch (err) {
        // Resource likely already existed due to retry.
      }
    });

    after(async () => {
      const projectId = await instancesClient.getProjectId();

      await projectsClient.setUsageExportBucket({
        project: projectId,
        usageExportLocationResource: {},
      });

      await storage.bucket(bucketName).delete();
    });

    it('should set empty default value in reportNamePrefix', async function () {
      this.retries(3);
      await delay(this.test);
      const projectId = await instancesClient.getProjectId();

      const output = execSync(
        `node setUsageExportBucket ${projectId} ${bucketName}`
      );
      await new Promise(resolve => setTimeout(resolve, 5000));

      assert.match(
        output,
        /Setting reportNamePrefix to empty value causes the report to have the default prefix value `usage_gce`./
      );

      const [project] = await projectsClient.get({
        project: projectId,
      });

      const usageExportLocation = project.usageExportLocation;

      assert.match(usageExportLocation.bucketName, /test-bucket-name/);
      assert.equal(usageExportLocation.reportNamePrefix, '');
    });

    it('should get current default value in reportNamePrefix', async function () {
      this.retries(3);
      await delay(this.test);
      const projectId = await instancesClient.getProjectId();

      execSync(`node setUsageExportBucket ${projectId} ${bucketName}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      const output = execSync(`node getUsageExportBucket ${projectId}`);

      assert.match(
        output,
        /Report name prefix not set, replacing with default value of `usage_gce`./
      );

      assert.match(output, /Returned reportNamePrefix: usage_gce/);
    });

    it('should disable usage export', async function () {
      this.retries(3);
      await delay(this.test);
      const projectId = await instancesClient.getProjectId();

      execSync(`node setUsageExportBucket ${projectId} ${bucketName}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      execSync(`node disableUsageExport ${projectId}`);
      await new Promise(resolve => setTimeout(resolve, 5000));

      const [project] = await projectsClient.get({
        project: projectId,
      });

      assert.isUndefined(project.usageExportLocation);
    });
  });

  describe('pagination', () => {
    const projectId = 'windows-sql-cloud';

    it('should automatically iterate throught the pages', async () => {
      const output = execSync(`node listImages ${projectId}`);
      const lines = output.split(' - ');

      assert(lines.length > 3);
    });

    it('should iterate page by page granularly', async () => {
      const output = execSync(`node listImagesByPage ${projectId}`);

      assert.match(output, /Page 1/);
      assert.match(output, /Page 2/);
    });
  });

  const getInstance = async (projectId, zone, instanceName) => {
    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });
    return instance;
  };

  describe('start/stop instances', () => {
    it('should start/stop instances', async () => {
      const projectId = await instancesClient.getProjectId();
      const newInstanceName = `gcloud-test-instance-${uuid.v4().split('-')[0]}`;

      execSync(`node createInstance ${projectId} ${zone} ${newInstanceName}`);

      let instance = await getInstance(projectId, zone, newInstanceName);
      assert.equal(instance.status, 'RUNNING');

      const stopOutput = execSync(
        `node stopInstance ${projectId} ${zone} ${newInstanceName}`
      );
      assert.match(stopOutput, /Instance stopped/);

      instance = await getInstance(projectId, zone, newInstanceName);
      assert.equal(instance.status, 'TERMINATED');

      const startOutput = execSync(
        `node startInstance ${projectId} ${zone} ${newInstanceName}`
      );
      assert.match(startOutput, /Instance started/);

      instance = await getInstance(projectId, zone, newInstanceName);
      assert.equal(instance.status, 'RUNNING');

      execSync(`node deleteInstance ${projectId} ${zone} ${newInstanceName}`);
    });

    it('should start/stop instances with encrypted disks', async () => {
      const projectId = await instancesClient.getProjectId();
      const newInstanceName = `gcloud-test-instance-${uuid.v4().split('-')[0]}`;

      const KEY = uuid.v4().split('-').join('');
      const KEY_BASE64 = Buffer.from(KEY).toString('base64');

      const [response] = await instancesClient.insert({
        instanceResource: {
          name: newInstanceName,
          disks: [
            {
              initializeParams: {
                diskSizeGb: '10',
                sourceImage:
                  'projects/debian-cloud/global/images/family/debian-10',
              },
              autoDelete: true,
              boot: true,
              type: computeProtos.AttachedDisk.Type.PERSISTENT,
              diskEncryptionKey: {
                rawKey: KEY_BASE64,
              },
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

      const stopOutput = execSync(
        `node stopInstance ${projectId} ${zone} ${newInstanceName}`
      );
      assert.match(stopOutput, /Instance stopped/);

      let instance = await getInstance(projectId, zone, newInstanceName);
      assert.equal(instance.status, 'TERMINATED');

      const startOutput = execSync(
        `node startInstanceWithEncKey ${projectId} ${zone} ${newInstanceName} ${KEY_BASE64}`
      );
      assert.match(startOutput, /Instance with encryption key started/);

      instance = await getInstance(projectId, zone, newInstanceName);
      assert.equal(instance.status, 'RUNNING');

      execSync(`node deleteInstance ${projectId} ${zone} ${newInstanceName}`);
    });

    it('should reset instance', async () => {
      const projectId = await instancesClient.getProjectId();
      const newInstanceName = `gcloud-test-instance-${uuid.v4().split('-')[0]}`;

      execSync(`node createInstance ${projectId} ${zone} ${newInstanceName}`);

      const resetOutput = execSync(
        `node resetInstance ${projectId} ${zone} ${newInstanceName}`
      );
      assert.match(resetOutput, /Instance reset/);

      execSync(`node deleteInstance ${projectId} ${zone} ${newInstanceName}`);
    });
  });
});
