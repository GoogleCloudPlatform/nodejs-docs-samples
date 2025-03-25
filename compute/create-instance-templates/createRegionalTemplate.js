/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(templateName) {
  // [START compute_regional_template_create]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a regionInstanceTemplatesClient
  const regionInstanceTemplatesClient =
    new computeLib.RegionInstanceTemplatesClient();
  // Instantiate a regionOperationsClient
  const regionOperationsClient = new computeLib.RegionOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project that you want to use.
  const projectId = await regionInstanceTemplatesClient.getProjectId();
  // The region in which to create a template.
  const region = 'us-central1';
  // The name of the new template to create.
  // const templateName = 'regional-template-name';

  // Create a new instance template with the provided name and a specific instance configuration.
  async function createRegionalTemplate() {
    // Define the boot disk for the instance template
    const disk = new compute.AttachedDisk({
      initializeParams: new compute.AttachedDiskInitializeParams({
        sourceImage:
          'projects/debian-cloud/global/images/debian-12-bookworm-v20240815',
        diskSizeGb: '100',
        diskType: 'pd-balanced',
      }),
      autoDelete: true,
      boot: true,
      type: 'PERSISTENT',
    });

    // Define the network interface for the instance template
    const network = new compute.NetworkInterface({
      network: `projects/${projectId}/global/networks/default`,
    });

    // Define instance template
    const instanceTemplate = new compute.InstanceTemplate({
      name: templateName,
      properties: {
        disks: [disk],
        region,
        machineType: 'e2-medium',
        // The template connects the instance to the `default` network,
        // without specifying a subnetwork.
        networkInterfaces: [network],
      },
    });

    const [response] = await regionInstanceTemplatesClient.insert({
      project: projectId,
      region,
      instanceTemplateResource: instanceTemplate,
    });

    let operation = response.latestResponse;

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        region,
      });
    }

    console.log(`Template: ${templateName} created.`);
  }

  createRegionalTemplate();
  // [END compute_regional_template_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
