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
 * Creates new VM instances without using a CustomMachineType class.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to use, for example: us-west3-b
 * @param {string} instanceName - Name of the new machine.
 * @param {string} cpuSeries - Type of CPU you want to use.
 * @param {int} coreCount - Number of CPU cores you want to use.
 * @param {int} memory - The amount of memory for the VM instance, in megabytes.
 */
function main(projectId, zone, instanceName, cpuSeries, coreCount, memory) {
  // [START compute_custom_machine_type_create_without_helper]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const cpuSeries = 'N1';
  // const coreCount = 2
  // const memory = 256

  const compute = require('@google-cloud/compute');

  async function createWithoutHelper() {
    const instancesClient = new compute.InstancesClient();

    const machineType = `zones/${zone}/machineTypes/${cpuSeries}-${coreCount}-${memory}`;

    const [response] = await instancesClient.insert({
      instanceResource: {
        name: instanceName,
        disks: [
          {
            initializeParams: {
              diskSizeGb: '64',
              sourceImage:
                'projects/debian-cloud/global/images/family/debian-11/',
            },
            autoDelete: true,
            boot: true,
          },
        ],
        machineType,
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

  createWithoutHelper();
  // [END compute_custom_machine_type_create_without_helper]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
args[4] = parseInt(args[4]);
args[5] = parseInt(args[5]);

main(...args);
