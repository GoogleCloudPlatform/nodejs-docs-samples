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

async function main(snapshotScheduleName, diskName, region, zone) {
  // [START compute_snapshot_schedule_attach]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a disksClient
  const disksClient = new computeLib.DisksClient();
  // Instantiate a zoneOperationsClient
  const zoneOperationsClient = new computeLib.ZoneOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project name.
  const projectId = await disksClient.getProjectId();

  // The region where the snapshot schedule was created.
  // region = 'us-central1';

  // The zone where the disk is located.
  // zone = `${region}-f`;

  // The name of the disk.
  // diskName = 'disk-name';

  // The name of the snapshot schedule that you are applying to the disk.
  // snapshotScheduleName = 'snapshot-schedule-name';

  // Attach schedule to an existing disk.
  async function callAttachSnapshotSchedule() {
    const [response] = await disksClient.addResourcePolicies({
      project: projectId,
      zone,
      disk: diskName,
      disksAddResourcePoliciesRequestResource:
        new compute.DisksAddResourcePoliciesRequest({
          resourcePolicies: [
            `projects/${projectId}/regions/${region}/resourcePolicies/${snapshotScheduleName}`,
          ],
        }),
    });

    let operation = response.latestResponse;

    // Wait for the attach operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await zoneOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log(
      `Snapshot schedule: ${snapshotScheduleName} attached to disk: ${diskName}.`
    );
  }

  await callAttachSnapshotSchedule();
  // [END compute_snapshot_schedule_attach]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
