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
 * Creates a new Windows Server instance that has only an internal IP address.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone in which your instance is located, for example: us-west3-b
 * @param {string} instanceName - Name of the new machine.
 * @param {string} machineType - Machine type you want to create in following format:
 *    "zones/{zone}/machineTypes/{type_name}". For example:
 *    "zones/europe-west3-c/machineTypes/f1-micro"
 *    You can find the list of available machine types using:
 *    https://cloud.google.com/sdk/gcloud/reference/compute/machine-types/list
 * @param {string} sourceImageFamily - Name of the public image family for Windows Server or SQL Server images.
 *    https://cloud.google.com/compute/docs/images#os-compute-support
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
  machineType = 'n1-standard-1',
  sourceImageFamily = 'windows-2022',
  networkLink = 'global/networks/default',
  subnetworkLink = 'regions/europe-central2/subnetworks/default'
) {
  // [START compute_create_windows_instance_internal_ip]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const machineType = 'n1-standard-1';
  // const sourceImageFamily = 'windows-2022';
  // const networkLink = 'global/networks/default';
  // const subnetworkLink = 'regions/europe-central2/subnetworks/default';

  const compute = require('@google-cloud/compute');

  async function createWindowsServerInstanceInternalIP() {
    const instancesClient = new compute.InstancesClient();

    const [response] = await instancesClient.insert({
      instanceResource: {
        name: instanceName,
        disks: [
          {
            // Describe the size and source image of the boot disk to attach to the instance.
            initializeParams: {
              diskSizeGb: '64',
              sourceImage: `projects/windows-cloud/global/images/family/${sourceImageFamily}/`,
            },
            autoDelete: true,
            boot: true,
            type: 'PERSISTENT',
          },
        ],
        machineType: `zones/${zone}/machineTypes/${machineType}`,
        networkInterfaces: [
          {
            // You must verify or configure routes and firewall rules in your VPC network
            // to allow access to kms.windows.googlecloud.com.
            // More information about access to kms.windows.googlecloud.com: https://cloud.google.com/compute/docs/instances/windows/creating-managing-windows-instances#kms-server

            // Additionally, you must enable Private Google Access for subnets in your VPC network
            // that contain Windows instances with only internal IP addresses.
            // More information about Private Google Access: https://cloud.google.com/vpc/docs/configure-private-google-access#enabling
            name: networkLink,
            subnetwork: subnetworkLink,
          },
        ],
        // If you chose an image that supports Shielded VM, you can optionally change the instance's Shielded VM settings.
        // "shieldedInstanceConfig": {
        //   "enableSecureBoot": true,
        //   "enableVtpm": true,
        //   "enableIntegrityMonitoring": true
        // },
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

  createWindowsServerInstanceInternalIP();
  // [END compute_create_windows_instance_internal_ip]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
