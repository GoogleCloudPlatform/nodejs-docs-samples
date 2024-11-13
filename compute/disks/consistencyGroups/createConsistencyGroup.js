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

async function main(consistencyGroupName, region) {
  // [START compute_consistency_group_create]
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
  // The project that contains the consistency group.
  const projectId = await resourcePoliciesClient.getProjectId();

  // The region for the consistency group.
  // If you want to add primary disks to consistency group, use the same region as the primary disks.
  // If you want to add secondary disks to the consistency group, use the same region as the secondary disks.
  // region = 'europe-central2';

  // The name for consistency group.
  // consistencyGroupName = 'consistency-group-name';

  async function callCreateConsistencyGroup() {
    // Create a resourcePolicyResource
    const resourcePolicyResource = new compute.ResourcePolicy({
      diskConsistencyGroupPolicy:
        new compute.ResourcePolicyDiskConsistencyGroupPolicy({}),
      name: consistencyGroupName,
    });

    const [response] = await resourcePoliciesClient.insert({
      project: projectId,
      region,
      resourcePolicyResource,
    });

    let operation = response.latestResponse;

    // Wait for the create group operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await regionOperationsClient.wait({
        operation: operation.name,
        project: projectId,
        region,
      });
    }

    console.log(`Consistency group: ${consistencyGroupName} created.`);
  }

  await callCreateConsistencyGroup();
  // [END compute_consistency_group_create]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
