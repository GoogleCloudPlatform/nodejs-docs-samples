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
  // [START compute_snapshot_schedule_get]
  // Import the Compute library
  const computeLib = require('@google-cloud/compute');

  // Instantiate a resourcePoliciesClient
  const resourcePoliciesClient = new computeLib.ResourcePoliciesClient();

  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // The project name.
  const projectId = await resourcePoliciesClient.getProjectId();

  // The location of the snapshot schedule resource policy.
  // region = 'us-central1';

  // The name of the snapshot schedule.
  // snapshotScheduleName = 'snapshot-schedule-name';

  async function callGetSnapshotSchedule() {
    const [response] = await resourcePoliciesClient.get({
      project: projectId,
      region,
      resourcePolicy: snapshotScheduleName,
    });

    console.log(JSON.stringify(response));
  }

  await callGetSnapshotSchedule();
  // [END compute_snapshot_schedule_get]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
