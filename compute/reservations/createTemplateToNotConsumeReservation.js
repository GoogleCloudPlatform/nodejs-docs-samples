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
  // [START compute_template_not_consume_reservation]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate an instanceTemplatesClient
  const instanceTemplatesClient = new computeLib.InstanceTemplatesClient();
  // Instantiate a globalOperationsClient
  const globalOperationsClient = new computeLib.GlobalOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The ID of the project where you want to create template.
  const projectId = await instanceTemplatesClient.getProjectId();
  // The name of the template to create.
  // const templateName = 'instance-01';

  // Create an instance template that creates VMs that don't explicitly consume reservations
  async function callCreateTemplateToNotConsumeReservation() {
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

    // Define reservationAffinity
    const reservationAffinity = new compute.ReservationAffinity({
      consumeReservationType: 'NO_RESERVATION',
    });

    // Define instance template
    const instanceTemplate = new compute.InstanceTemplate({
      name: templateName,
      properties: {
        disks: [disk],
        machineType: 'e2-medium',
        // The template connects the instance to the `default` network,
        // without specifying a subnetwork.
        networkInterfaces: [network],
        reservationAffinity,
      },
    });

    const [response] = await instanceTemplatesClient.insert({
      project: projectId,
      instanceTemplateResource: instanceTemplate,
    });

    let operation = response.latestResponse;

    // Wait for the create instance operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await globalOperationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    console.log(`Template ${templateName} created.`);
  }

  await callCreateTemplateToNotConsumeReservation();
  // [END compute_template_not_consume_reservation]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
