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
 * Resets a stopped Google Compute Engine instance (with unencrypted disks).
 *
 * @param {string} projectId - project ID or project number of the Cloud project your instance belongs to.
 * @param {string} zone - name of the zone your instance belongs to.
 * @param {string} instanceName - name of the instance your want to reset.
 */
function main(projectId, zone, instanceName) {
  // [START compute_reset_instance]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b'
  // const instanceName = 'YOUR_INSTANCE_NAME'

  const compute = require('@google-cloud/compute');

  async function resetInstance() {
    const instancesClient = new compute.InstancesClient();

    const [response] = await instancesClient.reset({
      project: projectId,
      zone,
      instance: instanceName,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Instance reset.');
  }

  resetInstance();
  // [END compute_reset_instance]
}

main(...process.argv.slice(2));
