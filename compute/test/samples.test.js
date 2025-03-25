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

const {generateTestId, getStaleVMInstances, deleteInstance} = require('./util');

const instancesClient = new compute.InstancesClient();
const projectsClient = new compute.ProjectsClient();
const firewallsClient = new compute.FirewallsClient();
const instanceTemplatesClient = new compute.InstanceTemplatesClient();

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

const getInstance = async (projectId, zone, instanceName) => {
  const [instance] = await instancesClient.get({
    project: projectId,
    zone,
    instance: instanceName,
  });
  return instance;
};

describe('samples', () => {
  const instanceName = generateTestId();
  const zone = 'europe-central2-b';
  const bucketName = `test-bucket-name-${uuid.v4().split('-')[0]}`;

  const storage = new Storage();

  after(async () => {
    const instances = await getStaleVMInstances();
    await Promise.all(
      instances.map(instance =>
        deleteInstance(instance.zone, instance.instanceName)
      )
    );
  });

  it('should create instance', async () => {
    const projectId = await instancesClient.getProjectId();
    const output = execSync(
      `node createInstance ${projectId} ${zone} ${instanceName}`
    );
    assert.match(output, /Instance created./);
  });

  it('should print instance data', async () => {
    const projectId = await instancesClient.getProjectId();
    const output = execSync(
      `node getInstance ${projectId} ${zone} ${instanceName}`
    );
    assert.include(output, `"name": "${instanceName}"`);
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

  it('should create an instance with local SSD', async () => {
    const projectId = await instancesClient.getProjectId();
    const instanceName = `gcloud-test-instance-${uuid.v4().split('-')[0]}`;

    const output = execSync(
      `node createInstanceWithLocalSSD ${projectId} ${zone} ${instanceName}`
    );
    assert.include(output, 'Instance created with local SSD: ');

    await instancesClient.delete({
      project: projectId,
      zone: zone,
      instance: instanceName,
    });
  }).timeout(100000);

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
                  'projects/debian-cloud/global/images/family/debian-11',
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

  describe('firewall', () => {
    // Clean stale firewall rules, in case prior test runs have failed.
    before(async () => {
      const FOUR_HOURS = 1000 * 60 * 60 * 4;
      const projectId = await instancesClient.getProjectId();
      for await (const rule of firewallsClient.listAsync({
        project: projectId,
      })) {
        const created = new Date(rule.creationTimestamp).getTime();
        // Delete firewalls that are older than 4 hours and match our
        // test prefix.
        if (
          created < Date.now() - FOUR_HOURS &&
          rule.name.startsWith('test-firewall-rule')
        ) {
          console.info(`deleting stale firewall ${rule.name}`);
          await firewallsClient.delete({
            project: projectId,
            firewall: rule.name,
          });
        }
      }
    });

    it('should create and delete firewall rule', async function () {
      this.retries(3);
      await delay(this.test);

      const projectId = await instancesClient.getProjectId();
      const firewallRuleName = `test-firewall-rule-${uuid.v4().split('-')[0]}`;

      let output = execSync(
        `node firewall/createFirewallRule ${projectId} ${firewallRuleName}`
      );
      assert.match(output, /Firewall rule created/);

      output = execSync(
        `node firewall/deleteFirewallRule ${projectId} ${firewallRuleName}`
      );
      assert.match(output, /Firewall rule deleted/);
    });

    it('should list firewall rules', async function () {
      this.retries(3);
      await delay(this.test);

      const projectId = await instancesClient.getProjectId();
      const firewallRuleName = `test-firewall-rule-${uuid.v4().split('-')[0]}`;

      execSync(
        `node firewall/createFirewallRule ${projectId} ${firewallRuleName}`
      );
      const output = execSync(`node firewall/listFirewallRules ${projectId}`);
      assert.isTrue(output.includes(`- ${firewallRuleName}:`));

      execSync(
        `node firewall/deleteFirewallRule ${projectId} ${firewallRuleName}`
      );
    });

    it('should patch firewall rule', async function () {
      this.retries(3);
      await delay(this.test);

      const projectId = await instancesClient.getProjectId();
      const firewallRuleName = `test-firewall-rule-${uuid.v4().split('-')[0]}`;

      execSync(
        `node firewall/createFirewallRule ${projectId} ${firewallRuleName}`
      );

      let [firewallRule] = await firewallsClient.get({
        project: projectId,
        firewall: firewallRuleName,
      });

      assert.equal(firewallRule.priority, 1000);

      const output = execSync(
        `node firewall/patchFirewallPriority ${projectId} ${firewallRuleName} 500`
      );
      assert.match(output, /Firewall rule updated/);

      [firewallRule] = await firewallsClient.get({
        project: projectId,
        firewall: firewallRuleName,
      });

      assert.equal(firewallRule.priority, 500);

      execSync(
        `node firewall/deleteFirewallRule ${projectId} ${firewallRuleName}`
      );
    });
  });

  describe('instance template', () => {
    const instanceTemplateName = `instance-template-${uuid.v4().split('-')[0]}`;
    const zone = 'europe-central2-b';

    before(async () => {
      const projectId = await instancesClient.getProjectId();
      const [response] = await instanceTemplatesClient.insert({
        project: projectId,
        instanceTemplateResource: {
          name: instanceTemplateName,
          properties: {
            machineType: 'n1-standard-1',
            disks: [
              {
                initializeParams: {
                  diskSizeGb: '10',
                  sourceImage:
                    'projects/debian-cloud/global/images/family/debian-11',
                },
                autoDelete: true,
                boot: true,
                type: computeProtos.AttachedDisk.Type.PERSISTENT,
              },
            ],
            networkInterfaces: [
              {
                name: 'global/networks/default',
              },
            ],
          },
        },
      });

      let operation = response.latestResponse;
      const operationsClient = new compute.GlobalOperationsClient();

      // Wait for the create operation to complete.
      while (operation.status !== 'DONE') {
        [operation] = await operationsClient.wait({
          operation: operation.name,
          project: projectId,
        });
      }
    });

    after(async () => {
      const projectId = await instancesClient.getProjectId();
      const [response] = await instanceTemplatesClient.delete({
        project: projectId,
        instanceTemplate: instanceTemplateName,
      });

      let operation = response.latestResponse;
      const operationsClient = new compute.GlobalOperationsClient();

      // Wait for the create operation to complete.
      while (operation.status !== 'DONE') {
        [operation] = await operationsClient.wait({
          operation: operation.name,
          project: projectId,
        });
      }
    });

    it('should create instance from template', async () => {
      const projectId = await instancesClient.getProjectId();
      const instanceName = `instance-${uuid.v4().split('-')[0]}`;

      const output = execSync(
        `node createInstanceFromTemplate ${projectId} ${zone} ${instanceName} global/instanceTemplates/${instanceTemplateName}`
      );
      assert.include(output, 'Instance created.');

      execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
    });

    it('should create instance from template with overrides', async () => {
      const projectId = await instancesClient.getProjectId();
      const instanceName = `instance-${uuid.v4().split('-')[0]}`;

      const output = execSync(
        `node createInstanceFromTemplateWithOverrides ${projectId} ${zone} ${instanceName} ${instanceTemplateName}`
      );
      assert.include(output, 'Instance created.');

      const instance = await getInstance(projectId, zone, instanceName);
      assert.equal(instance.disks.length, 2);

      execSync(`node deleteInstance ${projectId} ${zone} ${instanceName}`);
    });
  });
});
