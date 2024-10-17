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

async function main(queuedResourceName, zone) {
  // [START tpu_queued_resources_get]
  // Import the TPU library
  const {TpuClient} = require('@google-cloud/tpu').v2alpha1;

  // Instantiate a tpuClient
  const tpuClient = new TpuClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project, where you want to retrive node.
  const projectId = await tpuClient.getProjectId();

  // The name of queued resource.
  // queuedResourceName = 'queued-resource-1';

  // The zone of your queued resource.
  // zone = 'europe-west4-a';

  async function callGetQueuedResource() {
    const request = {
      name: `projects/${projectId}/locations/${zone}/queuedResources/${queuedResourceName}`,
    };

    const [response] = await tpuClient.getQueuedResource(request);

    console.log(JSON.stringify(response));
    console.log(`Queued resource ${queuedResourceName} retrived.`);
  }
  await callGetQueuedResource();
  // [END tpu_queued_resources_get]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
