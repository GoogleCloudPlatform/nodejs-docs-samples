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
 * Creates a new VM instance with Debian 10 operating system in specified network and subnetwork.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone to create the instance in. For example: "us-west3-b".
 * @param {string} instanceName - Name of the new virtual machine (VM) instance.
 * @param {string} networkLink - Name of the network you want the new instance to use.
 *   For example: "global/networks/default" represents the network
 *   named "default", which is created automatically for each project.
 * @param {string} subnetworkLink - Name of the subnetwork you want the new instance to use.
 *   This value uses the following format:
 *   "regions/{region}/subnetworks/{subnetwork_name}"
 */
function main(
  projectId,
  zone,
  instanceName,
  networkLink = 'global/networks/default',
  subnetworkLink = 'regions/europe-central2/subnetworks/default'
) {
  // [START compute_instances_create_with_subnet]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const networkLink = 'global/networks/default';
  // const subnetworkLink = 'regions/europe-central2/subnetworks/default';

  const compute = require('@google-cloud/compute');

  // Creates a new VM instance with Debian 10 operating system in specified network and subnetwork.
  async function createInstanceWithSubnet() {
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
        ],
        machineType: `zones/${zone}/machineTypes/n1-standard-1`,
        networkInterfaces: [
          {
            name: networkLink,
            subnetwork: subnetworkLink,
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

  createInstanceWithSubnet();
  // [END compute_instances_create_with_subnet]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
