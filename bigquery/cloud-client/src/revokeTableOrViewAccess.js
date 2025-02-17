// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {BigQuery} = require('@google-cloud/bigquery');

// [START bigquery_revoke_access_to_table_or_view]
/**
 * Revokes access to a BigQuery table or view
 * @param {Object} params - The parameters object
 * @param {string} params.projectId - The ID of the Google Cloud project
 * @param {string} params.datasetId - The ID of the dataset containing the table/view
 * @param {string} params.resourceId - The ID of the table or view
 * @param {string} [params.memberToRevoke] - Optional. Specific member to revoke access from (e.g., 'group:example@google.com')
 * @param {string} [params.roleToRevoke='roles/bigquery.dataViewer'] - Optional. Specific role to revoke
 * @returns {Promise<void>}
 */
async function revokeTableOrViewAccess({
  projectId,
  datasetId,
  resourceId,
  memberToRevoke,
  roleToRevoke = 'roles/bigquery.dataViewer',
}) {
  try {
    // Create BigQuery client
    const bigquery = new BigQuery({
      projectId: projectId,
    });

    // Get reference to the table or view
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(resourceId);

    // Get current IAM policy
    const [policy] = await table.iam.getPolicy();
    console.log(
      'Current IAM Policy:',
      JSON.stringify(policy.bindings, null, 2)
    );

    // Filter bindings based on parameters
    let newBindings = policy.bindings;

    if (memberToRevoke) {
      // Remove specific member from specific role
      newBindings = policy.bindings
        .map(binding => ({
          ...binding,
          members:
            binding.role === roleToRevoke
              ? binding.members.filter(member => member !== memberToRevoke)
              : binding.members,
        }))
        .filter(binding => binding.members.length > 0);
    } else {
      // Remove all bindings for the specified role
      newBindings = policy.bindings.filter(
        binding => binding.role !== roleToRevoke
      );
    }

    // Create new policy with updated bindings
    const newPolicy = {
      bindings: newBindings,
    };

    // Set the new IAM policy
    await table.iam.setPolicy(newPolicy);
    console.log(`Access revoked successfully for ${resourceId}`);

    // Verify the changes
    const [updatedPolicy] = await table.iam.getPolicy();
    console.log(
      'Updated IAM Policy:',
      JSON.stringify(updatedPolicy.bindings, null, 2)
    );
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
}

// [END bigquery_revoke_access_to_table_or_view]

module.exports = {revokeTableOrViewAccess};
