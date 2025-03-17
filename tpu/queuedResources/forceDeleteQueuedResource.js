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

async function main(tpuClient) {
  // [START tpu_queued_resources_delete_force]
  // Import the TPUClient
  // TODO(developer): Uncomment below line before running the sample.
  // const {TpuClient} = require('@google-cloud/tpu').v2alpha1;

  // Instantiate a tpuClient
  // TODO(developer): Uncomment below line before running the sample.
  // tpuClient = new TpuClient();

  /**
   * TODO(developer): Update these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project, where you want to delete node.
  const projectId = await tpuClient.getProjectId();

  // The name of queued resource.
  const queuedResourceName = 'queued-resource-1';

  // The zone of your queued resource.
  const zone = 'us-central1-a';

  async function callForceDeleteQueuedResource() {
    const request = {
      name: `projects/${projectId}/locations/${zone}/queuedResources/${queuedResourceName}`,
      force: true,
    };

    const [operation] = await tpuClient.deleteQueuedResource(request);

    // Wait for the delete operation to complete.
    const [response] = await operation.promise();

    console.log(`Queued resource ${queuedResourceName} deletion forced.`);
    return response;
  }
  return await callForceDeleteQueuedResource();
  // [END tpu_queued_resources_delete_force]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
