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
  // [START compute_snapshot_schedule_edit]
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

  async function callEditSnapshotSchedule() {
    const [response] = await resourcePoliciesClient.patch({
      project: projectId,
      region,
      resourcePolicy: snapshotScheduleName,
      resourcePolicyResource: compute.ResourcePolicy({
        snapshotSchedulePolicy:
          compute.ResourcePolicyInstanceSchedulePolicySchedule({
            schedule: compute.ResourcePolicySnapshotSchedulePolicySchedule({
              weeklySchedule: compute.ResourcePolicyWeeklyCycle({
                dayOfWeeks: [
                  compute.ResourcePolicyWeeklyCycleDayOfWeek({
                    day: 'Tuesday',
                    startTime: '9:00',
                  }),
                ],
              }),
            }),
          }),
      }),
    });

    let operation = response.latestResponse;

    // Wait for the edit operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        region,
      });
    }

    console.log(`Snapshot schedule: ${snapshotScheduleName} edited.`);
  }

  await callEditSnapshotSchedule();
  // [END compute_snapshot_schedule_edit]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
