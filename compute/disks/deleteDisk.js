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

/**
 * Deletes a disk from a project.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone in which is the disk you want to delete.
 * @param {string} diskName - Name of the disk you want to delete.
 */
function main(projectId, zone, diskName) {
  // [START compute_disk_delete]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const diskName = 'YOUR_DISK_NAME';

  const compute = require('@google-cloud/compute');

  async function deleteDisk() {
    const disksClient = new compute.DisksClient();

    const [response] = await disksClient.delete({
      project: projectId,
      zone,
      disk: diskName,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the create disk operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Disk deleted.');
  }

  deleteDisk();
  // [END compute_disk_delete]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
