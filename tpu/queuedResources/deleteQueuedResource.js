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
  // [START tpu_queued_resources_delete]
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

  async function callDeleteTpuVM(nodeName) {
    const request = {
      name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
    };

    const [operation] = await tpuClient.deleteNode(request);

    // Wait for the delete operation to complete.
    await operation.promise();

    console.log(`Node: ${nodeName} deleted.`);
  }

  async function callDeleteQueuedResource() {
    const request = {
      name: `projects/${projectId}/locations/${zone}/queuedResources/${queuedResourceName}`,
    };

    // Retrive node name
    const [queuedResource] = await tpuClient.getQueuedResource(request);
    const nodeName = queuedResource.tpu.nodeSpec[0].nodeId;

    // Before deleting the queued resource it is required to delete the TPU VM.
    await callDeleteTpuVM(nodeName);

    const [operation] = await tpuClient.deleteQueuedResource(request);

    // Wait for the delete operation to complete.
    const [response] = await operation.promise();

    console.log(`Queued resource ${queuedResourceName} deleted.`);
    return response;
  }
  return await callDeleteQueuedResource();
  // [END tpu_queued_resources_delete]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
