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

const {TpuClient} = require('@google-cloud/tpu').v2;

const tpuClient = new TpuClient();

async function getTpuZones() {
  const projectId = await tpuClient.getProjectId();
  const parent = `projects/${projectId}/locations/-`; // List zones for the project

  const [operations] = await tpuClient.listAcceleratorTypes({parent});
  const zones = new Set();
  operations.forEach(operation => {
    zones.add(operation.name.split('/')[3]);
  });

  return Array.from(zones);
}

/**
 * Get nodes created more than one hour ago.
 */
async function getStaleNodes(prefix) {
  const projectId = await tpuClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 1);

  const zones = await getTpuZones();

  for (const zone of zones) {
    const [list] = await tpuClient.listNodes({
      parent: `projects/${projectId}/locations/${zone}`,
    });

    for (const tpuObject of list) {
      const name = tpuObject.name.split('/').slice(-1)[0];
      const data = new Date(tpuObject.createTime.nanos / 1000000);
      if (data < currentDate) {
        if (data < currentDate && name.startsWith(prefix)) {
          result.push({
            zone,
            nodeName: name,
            timestamp: tpuObject.createTime,
          });
        }
      }
    }
  }
  return result;
}

async function deleteNode(zone, nodeName) {
  const projectId = await tpuClient.getProjectId();

  const request = {
    name: `projects/${projectId}/locations/${zone}/nodes/${nodeName}`,
  };

  console.log('Deleting node:', nodeName);

  const [operation] = await tpuClient.deleteNode(request);

  // Wait for the delete operation to complete.
  await operation.promise();
}

module.exports = {
  getStaleNodes,
  deleteNode,
};
