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
 * Creates a new VM instance with custom image used as its boot disk.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone to create the instance in. For example: "us-west3-b"
 * @param {string} instanceName - Name of the new virtual machine (VM) instance.
 * @param {string} customImageLink - Link to the custom image you want to use in the form of:
 *   "projects/{project_name}/global/images/{image_name}"
 */
function main(projectId, zone, instanceName, customImageLink) {
  // [START compute_instances_create_from_custom_image]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const customImageLink = 'projects/YOUR_PROJECT/global/images/YOUR_IMAGE_NAME';

  const compute = require('@google-cloud/compute');

  // Creates a new VM instance with custom image used as its boot disk.
  async function createInstanceFromCustomImage() {
    const instancesClient = new compute.InstancesClient();

    const [response] = await instancesClient.insert({
      project: projectId,
      zone,
      instanceResource: {
        name: instanceName,
        disks: [
          {
            initializeParams: {
              diskSizeGb: '10',
              sourceImage: customImageLink,
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

  createInstanceFromCustomImage();
  // [END compute_instances_create_from_custom_image]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
