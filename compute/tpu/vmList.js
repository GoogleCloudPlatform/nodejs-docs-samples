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

async function main(zone) {
  // [START tpu_vm_list]
  // Import TpuClient
  const {TpuClient} = require('@google-cloud/tpu').v2;

  // Instantiate a tpuClient
  const tpuClient = new TpuClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project you want to retrive a list of TPU nodes.
  const projectId = await tpuClient.getProjectId();

  // The zone from which the TPUs are retrived.
  //   zone = 'us-central1-a';

  async function callTpuVMList() {
    const request = {
      parent: `projects/${projectId}/locations/${zone}`,
    };

    const [response] = await tpuClient.listNodes(request);

    console.log(JSON.stringify(response));
  }

  await callTpuVMList();
  // [END tpu_vm_list]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
