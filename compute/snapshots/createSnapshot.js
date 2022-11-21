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
 * Creates a snapshot of a disk.
 *
 * You need to pass `zone` or `region` parameter relevant to the disk you want to
 * snapshot, but not both. Pass `zone` parameter for zonal disks and `region` for
 * regional disks.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} diskName - Name of the disk you want to snapshot.
 * @param {string} snapshotName - Name of the snapshot to be created.
 * @param {string} zone - Name of the zone in which is the disk you want to snapshot (for zonal disks).
 * @param {string} region - Name of the region in which is the disk you want to snapshot (for regional disks).
 * @param {string} location - The Cloud Storage multi-region or the Cloud Storage region where you
 *   want to store your snapshot.
 *   You can specify only one storage location. Available locations:
 *   https://cloud.google.com/storage/docs/locations#available-locations
 * @param {string} diskProjectId - project ID or project number of the Cloud project that
 *   hosts the disk you want to snapshot. If not provided, will look for
 *   the disk in the `project_id` project.
 */

function main(
  projectId,
  diskName,
  snapshotName,
  zone,
  region,
  location,
  diskProjectId
) {
  // [START compute_snapshot_create]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const diskName = 'YOUR_DISK_NAME';
  // const snapshotName = 'YOUR_SNAPSHOT_NAME';
  // const zone = 'europe-central2-b';
  // const region = '';
  // const location = 'europe-central2';
  // let diskProjectId = 'YOUR_DISK_PROJECT_ID';

  const compute = require('@google-cloud/compute');

  async function createSnapshot() {
    const snapshotsClient = new compute.SnapshotsClient();

    let disk;

    if (!zone && !region) {
      throw new Error(
        'You need to specify `zone` or `region` for this function to work.'
      );
    }

    if (zone && region) {
      throw new Error("You can't set both `zone` and `region` parameters");
    }

    if (!diskProjectId) {
      diskProjectId = projectId;
    }

    if (zone) {
      const disksClient = new compute.DisksClient();
      [disk] = await disksClient.get({
        project: diskProjectId,
        zone,
        disk: diskName,
      });
    } else {
      const regionDisksClient = new compute.RegionDisksClient();
      [disk] = await regionDisksClient.get({
        project: diskProjectId,
        region,
        disk: diskName,
      });
    }

    const snapshotResource = {
      name: snapshotName,
      sourceDisk: disk.selfLink,
    };

    if (location) {
      snapshotResource.storageLocations = [location];
    }

    const [response] = await snapshotsClient.insert({
      project: projectId,
      snapshotResource,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.GlobalOperationsClient();

    // Wait for the create snapshot operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    console.log('Snapshot created.');
  }

  createSnapshot();
  // [END compute_snapshot_create]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
