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
  // [START tpu_vm_create]
  // Import the TPUClient
  // TODO(developer): Uncomment below line before running the sample.
  // const {TpuClient} = require('@google-cloud/tpu').v2;
  const {Node, NetworkConfig} =
    require('@google-cloud/tpu').protos.google.cloud.tpu.v2;

  // Instantiate a tpuClient
  // TODO(developer): Uncomment below line before running the sample.
  // tpuClient = new TpuClient();

  // TODO(developer): Update below line before running the sample.
  // Project ID or project number of the Google Cloud project you want to create a node.
  const projectId = await tpuClient.getProjectId();

  // The name of the network you want the TPU node to connect to. The network should be assigned to your project.
  const networkName = 'compute-tpu-network';

  // The region of the network, that you want the TPU node to connect to.
  const region = 'europe-west4';

  // The name for your TPU.
  const nodeName = 'node-name-1';

  // The zone in which to create the TPU.
  // For more information about supported TPU types for specific zones,
  // see https://cloud.google.com/tpu/docs/regions-zones
  const zone = 'europe-west4-a';

  // The accelerator type that specifies the version and size of the Cloud TPU you want to create.
  // For more information about supported accelerator types for each TPU version,
  // see https://cloud.google.com/tpu/docs/system-architecture-tpu-vm#versions.
  const tpuType = 'v2-8';

  // Software version that specifies the version of the TPU runtime to install. For more information,
  // see https://cloud.google.com/tpu/docs/runtimes
  const tpuSoftwareVersion = 'tpu-vm-tf-2.14.1';

  async function callCreateTpuVM() {
    // Create a node
    const node = new Node({
      name: nodeName,
      zone,
      acceleratorType: tpuType,
      runtimeVersion: tpuSoftwareVersion,
      // Define network
      networkConfig: new NetworkConfig({
        enableExternalIps: true,
        network: `projects/${projectId}/global/networks/${networkName}`,
        subnetwork: `projects/${projectId}/regions/${region}/subnetworks/${networkName}`,
      }),
    });

    const parent = `projects/${projectId}/locations/${zone}`;
    const request = {parent, node, nodeId: nodeName};

    const [operation] = await tpuClient.createNode(request);

    // Wait for the create operation to complete.
    const [response] = await operation.promise();

    console.log(`TPU VM: ${nodeName} created.`);
    return response;
  }
  return await callCreateTpuVM();
  // [END tpu_vm_create]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
