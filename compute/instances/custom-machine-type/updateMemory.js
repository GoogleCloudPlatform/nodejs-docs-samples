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
 * Sends an update instance machine type request to the Compute Engine API and waits for it to complete.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to use, for example: us-west3-b
 * @param {string} instanceName - Name of the new machine.
 * @param {int} newMemory - The new amount of memory for the VM instance, in megabytes.
 */
function main(projectId, zone, instanceName, newMemory) {
  // [START compute_custom_machine_type_update_memory]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const newMemory = 256;

  const compute = require('@google-cloud/compute');

  async function modifyInstanceWithExtendedMemory() {
    const instancesClient = new compute.InstancesClient();

    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });

    if (
      !['machineTypes/n1-', 'machineTypes/n2-', 'machineTypes/n2d-'].some(
        type => instance.machineType.includes(type)
      )
    ) {
      throw new Error('extra memory is available only for N1, N2 and N2D CPUs');
    }

    // Make sure that the machine is turned off
    if (!['TERMINATED', 'STOPPED'].some(status => instance.status === status)) {
      const [response] = await instancesClient.stop({
        project: projectId,
        zone,
        instance: instanceName,
      });

      let operation = response.latestResponse;
      const operationsClient = new compute.ZoneOperationsClient();

      // Wait for the stop operation to complete.
      while (operation.status !== 'DONE') {
        [operation] = await operationsClient.wait({
          operation: operation.name,
          project: projectId,
          zone: operation.zone.split('/').pop(),
        });
      }
    }

    // Modify the machine definition, remember that extended memory
    // is available only for N1, N2 and N2D CPUs

    const start = instance.machineType.substring(
      0,
      instance.machineType.lastIndexOf('-')
    );

    const [response] = await instancesClient.setMachineType({
      project: projectId,
      zone,
      instance: instanceName,
      instancesSetMachineTypeRequestResource: {
        machineType: `${start}-${newMemory}-ext`,
      },
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the update operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Instance updated.');
  }

  modifyInstanceWithExtendedMemory();
  // [END compute_custom_machine_type_update_memory]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
args[3] = parseInt(args[3]);

main(...args);
