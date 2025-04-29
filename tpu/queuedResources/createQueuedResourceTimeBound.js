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
  // [START tpu_queued_resources_time_bound]
  // Import the TPUClient
  // TODO(developer): Uncomment below line before running the sample.
  // const {TpuClient} = require('@google-cloud/tpu').v2alpha1;
  const {Node, NetworkConfig, QueuedResource} =
    require('@google-cloud/tpu').protos.google.cloud.tpu.v2alpha1;

  // Instantiate a tpuClient
  // TODO(developer): Uncomment below line before running the sample.
  // tpuClient = new TpuClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // Project ID or project number of the Google Cloud project, where you want to create queued resource.
  const projectId = await tpuClient.getProjectId();

  // The name of the network you want the node to connect to. The network should be assigned to your project.
  const networkName = 'compute-tpu-network';

  // The region of the network, that you want the node to connect to.
  const region = 'us-central1';

  // The name for your queued resource.
  const queuedResourceName = 'queued-resource-1';

  // The name for your node.
  const nodeName = 'node-name-1';

  // The zone in which to create the node.
  // For more information about supported TPU types for specific zones,
  // see https://cloud.google.com/tpu/docs/regions-zones
  const zone = `${region}-a`;

  // The accelerator type that specifies the version and size of the node you want to create.
  // For more information about supported accelerator types for each TPU version,
  // see https://cloud.google.com/tpu/docs/system-architecture-tpu-vm#versions.
  const tpuType = 'v2-8';

  // Software version that specifies the version of the node runtime to install. For more information,
  // see https://cloud.google.com/tpu/docs/runtimes
  const tpuSoftwareVersion = 'tpu-vm-tf-2.14.1';

  async function callCreateQueuedResourceTimeBound() {
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
      queuedResource: `projects/${projectId}/locations/${zone}/queuedResources/${queuedResourceName}`,
    });

    // Define parent for requests
    const parent = `projects/${projectId}/locations/${zone}`;

    // Create queued resource
    const queuedResource = new QueuedResource({
      name: queuedResourceName,
      tpu: {
        nodeSpec: [
          {
            parent,
            node,
            nodeId: nodeName,
          },
        ],
      },
      queueingPolicy: new QueuedResource.QueueingPolicy({
        // You can specify a duration after which a resource should be allocated.
        validAfterDuration: {
          // format: hour * 3600s
          seconds: 6 * 3600,
        },
        // You can specify how long a queued resource request remains valid.
        // validUntilDuration: {
        //   // format: hour * 3600s
        //   seconds: 6 * 3600,
        // },
        // You can specify a time after which a resource should be allocated.
        // validAfterTime: {
        //   // format: new Date('YOUR_TIMESTAMP').getTime() / 1000
        //   seconds: new Date('2024-10-25T11:45:00Z').getTime() / 1000,
        // },
        // You can specify a time before which the resource should be allocated.
        // validUntilTime: {
        //   // format: new Date('YOUR_TIMESTAMP').getTime() / 1000
        //   seconds: new Date('2024-10-25T11:45:00Z').getTime() / 1000,
        // },
        // You can specify an allocation interval. `startTime` specifies the beginning of the allocation interval
        // and `endTime` specifies the end of the allocation interval.
        // validInterval: {
        //   // format: new Date('YOUR_TIMESTAMP').getTime() / 1000
        //   startTime: {
        //     seconds: new Date('2024-10-25T15:45:00Z').getTime() / 1000,
        //   },
        //   endTime: {
        //     seconds: new Date('2024-10-26T11:45:00Z').getTime() / 1000,
        //   },
        // },
      }),
    });

    const request = {
      parent: `projects/${projectId}/locations/${zone}`,
      queuedResource,
      queuedResourceId: queuedResourceName,
    };

    const [operation] = await tpuClient.createQueuedResource(request);

    // Wait for the create operation to complete.
    const [response] = await operation.promise();

    // You can wait until TPU Node is READY,
    // and check its status using getTpuVm() from `tpu_vm_get` sample.
    return response;
  }
  return await callCreateQueuedResourceTimeBound();
  // [END tpu_queued_resources_time_bound]
}

module.exports = main;

// TODO(developer): Uncomment below lines before running the sample.
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
