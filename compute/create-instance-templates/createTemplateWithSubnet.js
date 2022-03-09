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
 * Creates an instance template that uses a provided subnet.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you use.
 * @param {string} network - The network to be used in the new template. This value uses
 *    the following format: "projects/{project}/global/networks/{network}"
 * @param {string} subnetwork - The subnetwork to be used in the new template. This value
 *    uses the following format: "projects/{project}/regions/{region}/subnetworks/{subnetwork}"
 * @param {string} templateName - Name of the new template to create.
 */
function main(projectId, network, subnetwork, templateName) {
  // [START compute_template_create_with_subnet]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const network = 'projects/project/global/networks/network';
  // const subnetwork = 'projects/project/regions/region/subnetworks/subnetwork';
  // const templateName = 'your_template_name';

  const compute = require('@google-cloud/compute');

  // Create an instance template that uses a provided subnet.
  async function createTemplateWithSubnet() {
    const instanceTemplatesClient = new compute.InstanceTemplatesClient();

    const [response] = await instanceTemplatesClient.insert({
      project: projectId,
      instanceTemplateResource: {
        name: templateName,
        properties: {
          // The template describes the size and source image of the boot disk
          // to attach to the instance.
          disks: [
            {
              // The template describes the size and source image of the boot disk
              // to attach to the instance.
              initializeParams: {
                diskSizeGb: '250',
                sourceImage:
                  'projects/debian-cloud/global/images/family/debian-11',
              },
              autoDelete: true,
              boot: true,
            },
          ],
          machineType: 'e2-standard-4',
          // The template connects the instance to the specified network and subnetwork.
          networkInterfaces: [
            {
              network,
              subnetwork,
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

    console.log('Instance template created.');
  }

  createTemplateWithSubnet();
  // [END compute_template_create_with_subnet]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
