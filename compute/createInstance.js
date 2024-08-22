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

/**
 * Sends an instance creation request to GCP and waits for it to complete.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @param {string} instanceName - Name of the new machine.
 * @param {string} machineType - Machine type you want to create in following format:
 *    "zones/{zone}/machineTypes/{type_name}". For example:
 *    "zones/europe-west3-c/machineTypes/f1-micro"
 *    You can find the list of available machine types using:
 *    https://cloud.google.com/sdk/gcloud/reference/compute/machine-types/list
 * @param {string} sourceImage - Path the the disk image you want to use for your boot
 *    disk. This can be one of the public images
 *    (e.g. "projects/debian-cloud/global/images/family/debian-11")
 *    or a private image you have access to.
 *    You can check the list of available public images using:
 *    $ gcloud compute images list
 * @param {string} networkName - Name of the network you want the new instance to use.
 *    For example: global/networks/default - if you want to use the default network.
 */
function main(
  projectId,
  zone,
  instanceName,
  machineType = 'n1-standard-1',
  sourceImage = 'projects/debian-cloud/global/images/family/debian-11',
  networkName = 'global/networks/default'
) {
  // [START compute_instances_create]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b'
  // const instanceName = 'YOUR_INSTANCE_NAME'
  // const machineType = 'n1-standard-1';
  // const sourceImage = 'projects/debian-cloud/global/images/family/debian-11';
  // const networkName = 'global/networks/default';

  const compute = require('@google-cloud/compute');

  // Create a new instance with the values provided above in the specified project and zone.
  async function createInstance() {
    const instancesClient = new compute.InstancesClient();

    console.log(`Creating the ${instanceName} instance in ${zone}...`);

    const [response] = await instancesClient.insert({
      instanceResource: {
        name: instanceName,
        disks: [
          {
            // Describe the size and source image of the boot disk to attach to the instance.
            initializeParams: {
              diskSizeGb: '10',
              sourceImage,
            },
            autoDelete: true,
            boot: true,
            type: 'PERSISTENT',
          },
        ],
        machineType: `zones/${zone}/machineTypes/${machineType}`,
        networkInterfaces: [
          {
            // Use the network interface provided in the networkName argument.
            name: networkName,
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

  createInstance();
  // [END compute_instances_create]
}

main(...process.argv.slice(2));
