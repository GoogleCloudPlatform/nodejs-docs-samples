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
 * Delete a snapshot of a disk.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} snapshotName - Name of the snapshot to delete.
 */
function main(projectId, snapshotName) {
  // [START compute_snapshot_delete]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const snapshotName = 'YOUR_SNAPSHOT_NAME';

  const compute = require('@google-cloud/compute');

  async function deleteSnapshot() {
    const snapshotsClient = new compute.SnapshotsClient();

    const [response] = await snapshotsClient.delete({
      project: projectId,
      snapshot: snapshotName,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.GlobalOperationsClient();

    // Wait for the create disk operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    console.log('Snapshot deleted.');
  }

  deleteSnapshot();
  // [END compute_snapshot_delete]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
