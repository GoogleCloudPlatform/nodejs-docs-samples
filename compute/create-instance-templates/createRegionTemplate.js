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

async function main() {
  // [START compute_region_template_create]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a regionInstanceTemplatesClient
  const regionInstanceTemplatesClient =
    new computeLib.RegionInstanceTemplatesClient();
  // Instantiate a regionOperationsClient
  const regionOperationsClient = new computeLib.RegionOperationsClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  // The ID of the project where you want to use.
  const projectId = await regionInstanceTemplatesClient.getProjectId();
  // The region in which to create a template.
  const region = 'us-central1';
  // The zone in which to create a template.
  const zone = `${region}-a`;
  // The name of the new template to create.
  const templateName = 'region-template-name';

  // Create a new instance template with the provided name and a specific instance configuration.
  async function createRegionTemplate() {
    // Define the boot disk for the instance template
    const disk = new compute.AttachedDisk({
      initializeParams: new compute.AttachedDiskInitializeParams({
        sourceImage: 'projects/debian-cloud/global/images/family/debian-11',
        diskSizeGb: '100',
        diskType: 'pd-balanced',
      }),
      autoDelete: true,
      boot: true,
      type: 'PERSISTENT',
    });

    // Define the network interface for the instance template
    // Note: The subnetwork must be in the same region as the instance template.
    const network = new compute.Network({
      name: 'network-name',
      subnetworks: [
        `projects/${projectId}/regions/${region}/subnetworks/default`,
      ],
    });

    const [response] = await regionInstanceTemplatesClient.insert({
      project: projectId,
      // region: 'us-central1-a',
      instanceTemplateResource: {
        name: templateName,
        properties: {
          disks: [disk],
          machineType: 'n1-standard-1',
          // The template connects the instance to the `default` network,
          // without specifying a subnetwork.
          networkInterfaces: [network],
        },
      },
    });
    let operation = response.latestResponse;
    console.log(operation);

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }
    const createdTemplate = (
      await regionInstanceTemplatesClient.get({
        project: projectId,
        zone,
        instanceTemplate: templateName,
      })
    )[0];

    console.log(JSON.stringify(createdTemplate));
  }

  createRegionTemplate();
  // [END compute_region_template_create]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
