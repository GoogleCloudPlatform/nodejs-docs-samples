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
 * Create a new VM instance with Debian 10 operating system and a 11 GB additional empty disk.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone to create the instance in. For example: "us-west3-b"
 * @param {string} instanceName - Name of the new virtual machine (VM) instance.
 */
function main(projectId, zone, instanceName) {
  // [START compute_instances_create_from_image_plus_empty_disk]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';

  const compute = require('@google-cloud/compute');

  // Create a new VM instance with Debian 10 operating system and a 11 GB additional empty disk.
  async function createWithAdditionalDisk() {
    const instancesClient = new compute.InstancesClient();
    const imagesClient = new compute.ImagesClient();

    // List of public operating system (OS) images: https://cloud.google.com/compute/docs/images/os-details.
    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-11',
    });

    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: {
        name: instanceName,
        disks: [
          {
            initializeParams: {
              diskSizeGb: '10',
              sourceImage: newestDebian.selfLink,
              diskType: `zones/${zone}/diskTypes/pd-standard`,
            },
            autoDelete: true,
            boot: true,
            type: 'PERSISTENT',
          },
          {
            initializeParams: {
              diskSizeGb: '11',
              diskType: `zones/${zone}/diskTypes/pd-standard`,
            },
            autoDelete: true,
            boot: false,
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

  createWithAdditionalDisk();
  // [END compute_instances_create_from_image_plus_empty_disk]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
