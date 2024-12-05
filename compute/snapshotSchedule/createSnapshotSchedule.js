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

async function main(snapshotScheduleName, region) {
  // [START compute_snapshot_schedule_create]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');
  const compute = computeLib.protos.google.cloud.compute.v1;

  // Instantiate a resourcePoliciesClient
  const resourcePoliciesClient = new computeLib.ResourcePoliciesClient();
  // Instantiate a regionOperationsClient
  const regionOperationsClient = new computeLib.RegionOperationsClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project name.
  const projectId = await resourcePoliciesClient.getProjectId();

  // The location of the snapshot schedule resource policy.
  // region = 'us-central1';

  // The name of the snapshot schedule.
  // snapshotScheduleName = 'snapshot-schedule-name';

  // The description of the snapshot schedule.
  const snapshotScheduleDescription = 'snapshot schedule description...';

  async function callCreateSnapshotSchedule() {
    const [response] = await resourcePoliciesClient.insert({
      project: projectId,
      region,
      resourcePolicyResource: new compute.ResourcePolicy({
        name: snapshotScheduleName,
        description: snapshotScheduleDescription,
        snapshotSchedulePolicy:
          new compute.ResourcePolicyInstanceSchedulePolicySchedule({
            retentionPolicy:
              new compute.ResourcePolicySnapshotSchedulePolicyRetentionPolicy({
                maxRetentionDays: 5,
              }),
            schedule: new compute.ResourcePolicySnapshotSchedulePolicySchedule({
              // Similarly, you can create a weekly or monthly schedule.
              // Review the resourcePolicies.insert method for details specific to setting a weekly or monthly schedule.
              // To see more details, open: `https://cloud.google.com/compute/docs/disks/scheduled-snapshots?authuser=0#create_snapshot_schedule`
              dailySchedule: new compute.ResourcePolicyDailyCycle({
                startTime: '12:00',
                daysInCycle: 1,
              }),
            }),
            snapshotProperties:
              new compute.ResourcePolicySnapshotSchedulePolicySnapshotProperties(
                {
                  guestFlush: false,
                  labels: {
                    env: 'dev',
                    media: 'images',
                  },
                  // OPTIONAL: the storage location. If you omit this flag, the default storage location is used.
                  // storageLocations: 'storage-location',
                }
              ),
          }),
      }),
    });

    let operation = response.latestResponse;

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        region,
      });
    }

    console.log(`Snapshot schedule: ${snapshotScheduleName} created.`);
  }

  await callCreateSnapshotSchedule();
  // [END compute_snapshot_schedule_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
