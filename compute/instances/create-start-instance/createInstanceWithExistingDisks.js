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

/**
 * Create a new VM instance using selected disks. The first disk in diskNames will be used as boot disk.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone to create the instance in. For example: "us-west3-b"
 * @param {string} instanceName - Name of the new virtual machine (VM) instance.
 * @param {Array<string>} diskNames - Array of disk names to be attached to the new virtual machine.
 *    First disk in this list will be used as the boot device.
 */
function main(projectId, zone, instanceName, diskNames) {
  // [START compute_instances_create_with_existing_disks]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const diskNames = ['boot_disk', 'disk1', 'disk2'];

  const compute = require('@google-cloud/compute');

  async function createWithExistingDisks() {
    const instancesClient = new compute.InstancesClient();
    const disksClient = new compute.DisksClient();

    if (diskNames.length < 1) {
      throw new Error('At least one disk should be provided');
    }

    const disks = [];
    for (const diskName of diskNames) {
      const [disk] = await disksClient.get({
        project: projectId,
        zone,
        disk: diskName,
      });
      disks.push(disk);
    }

    const attachedDisks = [];

    for (const disk of disks) {
      attachedDisks.push({
        source: disk.selfLink,
      });
    }

    attachedDisks[0].boot = true;

    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: {
        name: instanceName,
        disks: attachedDisks,
        machineType: `zones/${zone}/machineTypes/n1-standard-1`,
        networkInterfaces: [
          {
            name: 'global/networks/default',
          },
        ],
      },
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Instance created.');
  }

  createWithExistingDisks();
  // [END compute_instances_create_with_existing_disks]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
args[3] = args[3].split(',');
main(...args);
