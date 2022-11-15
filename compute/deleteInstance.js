// Copyright 2021 Google LLC
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

/**
 * Sends a delete request to GCP and waits for it to complete.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @param {string} instanceName - Name of the instance you want to delete.
 */
function main(projectId, zone, instanceName) {
  // [START compute_instances_delete]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b'
  // const instanceName = 'YOUR_INSTANCE_NAME';

  const compute = require('@google-cloud/compute');

  // Delete the instance specified by `instanceName` if it's present in the given project and zone.
  async function deleteInstance() {
    const instancesClient = new compute.InstancesClient();

    console.log(`Deleting ${instanceName} from ${zone}...`);

    const [response] = await instancesClient.delete({
      project: projectId,
      zone,
      instance: instanceName,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the delete operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Instance deleted.');
  }

  deleteInstance();
  // [END compute_instances_delete]
}

main(...process.argv.slice(2));
