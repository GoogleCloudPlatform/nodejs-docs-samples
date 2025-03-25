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
 * Sends an instance creation request to the Compute Engine API and wait for it to complete.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @param {string} instanceName - Name of the new virtual machine.
 * @param {string} deleteProtection - boolean value indicating if the new virtual machine should be
 *    protected against deletion or not.
 */

function main(projectId, zone, instanceName, deleteProtection) {
  // [START compute_delete_protection_create]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const deleteProtection = true;

  const compute = require('@google-cloud/compute');

  // Send an instance creation request to the Compute Engine API and wait for it to complete.
  async function createInstance() {
    const instancesClient = new compute.InstancesClient();

    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: {
        name: instanceName,
        // Set the delete protection bit.
        deletionProtection: deleteProtection,
        disks: [
          {
            // Describe the size and source image of the boot disk to attach to the instance.
            initializeParams: {
              diskSizeGb: '10',
              sourceImage:
                'projects/debian-cloud/global/images/family/debian-11',
            },
            autoDelete: true,
            boot: true,
            type: 'PERSISTENT',
          },
        ],
        machineType: `zones/${zone}/machineTypes/e2-small`,
        networkInterfaces: [
          {
            // Use the default VPC network.
            name: 'default',
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

  createInstance();
  // [END compute_delete_protection_create]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
args[3] = args[3] === 'true';

main(...args);
