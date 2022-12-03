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
 * Creates a new disk in a project in given zone.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone to create the instance in. For example: "us-west3-b".
 * @param {string} diskName - Name of the disk you want to create.
 * @param {string} diskType - The type of disk you want to create. This value uses the following format:
 *   "zones/{zone}/diskTypes/(pd-standard|pd-ssd|pd-balanced|pd-extreme)".
 *   For example: "zones/us-west3-b/diskTypes/pd-ssd".
 * @param {int} diskSizeGb - Size of the new disk in gigabytes.
 * @param {string} snapshotLink - A link to the snapshot you want to use as a source for the new disk.
 *   This value uses the following format: "projects/{project_name}/global/snapshots/{snapshot_name}"
 */

function main(projectId, zone, diskName, diskType, diskSizeGb, snapshotLink) {
  // [START compute_disk_create_from_snapshot]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const diskName = 'YOUR_DISK_NAME';
  // const diskType = 'zones/us-west3-b/diskTypes/pd-ssd';
  // const diskSizeGb = 10;
  // const snapshotLink = 'projects/project_name/global/snapshots/snapshot_name';

  const compute = require('@google-cloud/compute');

  async function createDiskFromSnapshot() {
    const disksClient = new compute.DisksClient();

    const [response] = await disksClient.insert({
      project: projectId,
      zone,
      diskResource: {
        sizeGb: diskSizeGb,
        name: diskName,
        zone,
        type: diskType,
        sourceSnapshot: snapshotLink,
      },
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

    console.log('Disk created.');
  }

  createDiskFromSnapshot();
  // [END compute_disk_create_from_snapshot]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
args[4] = parseInt(args[4]);
main(...args);
