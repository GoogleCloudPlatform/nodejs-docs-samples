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
const {Storage} = require('@google-cloud/storage');

const {describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const {assert} = require('chai');

const instancesClient = new compute.InstancesClient({fallback: 'rest'});
const projectsClient = new compute.ProjectsClient({fallback: 'rest'});

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

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
      await storage.createBucket(bucketName);
    });

    after(async () => {
      const projectId = await instancesClient.getProjectId();

      await projectsClient.setUsageExportBucket({
        project: projectId,
        usageExportLocationResource: {},
      });

      await storage.bucket(bucketName).delete();
    });

    it('should set empty default value in reportNamePrefix', async () => {
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

      assert.equal(usageExportLocation.bucketName, bucketName);
      assert.equal(usageExportLocation.reportNamePrefix, '');
    });

    it('should get current default value in reportNamePrefix', async () => {
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

    it('should disable usage export', async () => {
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
});
