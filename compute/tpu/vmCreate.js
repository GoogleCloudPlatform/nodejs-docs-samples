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

async function main(nodeName, zone, tpuType, tpuSoftwareVersion) {
  // [START tpu_vm_create]
  // Import the TPU library
  const tpuLib = require('@google-cloud/tpu');
  const tpu = tpuLib.protos.google.cloud.tpu.v2;

  // Instantiate a tpuClient
  const tpuClient = new tpuLib.TpuClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project you want to create a node.
  const projectId = await tpuClient.getProjectId();

  // The name for your TPU.
  // nodeName = 'node-name-1';

  // The zone in which to create the TPU.
  // For more information about supported TPU types for specific zones,
  // see https://cloud.google.com/tpu/docs/regions-zones
  // zone = 'us-central1-b';

  // The accelerator type that specifies the version and size of the Cloud TPU you want to create.
  // For more information about supported accelerator types for each TPU version,
  // see https://cloud.google.com/tpu/docs/system-architecture-tpu-vm#versions.
  // tpuType = 'v2-8';

  // Software version that specifies the version of the TPU runtime to install. For more information,
  // see https://cloud.google.com/tpu/docs/runtimes
  // tpuSoftwareVersion = 'tpu-vm-tf-2.14.1';

  async function callCreateTpuVM() {
    // Create a node
    const node = new tpu.Node({
      name: nodeName,
      zone,
      apiVersion: tpu.Node.ApiVersion.V2,
      acceleratorType: tpuType,
      // Ensure that the tpuSoftwareVersion you're using (e.g., 'tpu-vm-tf-2.14.1') is a valid and supported TensorFlow version for the selected tpuType and zone.
      // You can find a list of supported versions in the Cloud TPU documentation: https://cloud.google.com/tpu/docs/system-architecture-tpu-vm#versions
      tensorflowVersion: tpuSoftwareVersion,
      networkConfig: tpu.NetworkConfig({enableExternalIps: true}),
      shieldedInstanceConfig: tpu.ShieldedInstanceConfig({
        enableSecureBoot: true,
      }),
    });
    const parent = `projects/${projectId}/locations/${zone}`;
    const request = {parent, node, nodeId: nodeName};

    const [operation] = await tpuClient.createNode(request);

    // Wait for the delete operation to complete.
    const [response] = await operation.promise();

    console.log(JSON.stringify(response));
    console.log(`TPU VM: ${nodeName} created.`);
  }
  await callCreateTpuVM();
  // [END tpu_vm_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
