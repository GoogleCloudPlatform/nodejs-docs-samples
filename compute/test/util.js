// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const uuid = require('uuid');
const compute = require('@google-cloud/compute');

const PREFIX = 'gcloud-test-';

const instancesClient = new compute.InstancesClient();

// Get a unique ID to use for test resources.
function generateTestId() {
  return `${PREFIX}-${uuid.v4()}`.substr(0, 30);
}

/**
 * Get VM instances created more than one hour ago.
 */
async function getStaleVMInstances() {
  const projectId = await instancesClient.getProjectId();
  const result = [];
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 3);

  const aggListRequest = instancesClient.aggregatedListAsync({
    project: projectId,
  });

  for await (const [zone, instancesObject] of aggListRequest) {
    const instances = instancesObject.instances;
    result.push(
      ...instances
        .filter(
          instance =>
            new Date(instance.creationTimestamp) < currentDate &&
            instance.name.startsWith(PREFIX)
        )
        .map(instance => {
          return {
            zone: zone.split('zones/')[1],
            instanceName: instance.name,
            timestamp: instance.creationTimestamp,
          };
        })
    );
  }

  return result;
}

async function deleteInstance(zone, instanceName) {
  const projectId = await instancesClient.getProjectId();

  const [response] = await instancesClient.delete({
    project: projectId,
    instance: instanceName,
    zone,
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.ZoneOperationsClient();

  console.log(`Deleting ${instanceName}`);

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
      zone,
    });
  }
}

module.exports = {
  generateTestId,
  getStaleVMInstances,
  deleteInstance,
};
