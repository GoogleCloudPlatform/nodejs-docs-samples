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

'use strict';

/**
 * Revokes access to a BigQuery table or view
 * @param {string} projectId The ID of the Google Cloud project
 * @param {string} datasetId The ID of the dataset containing the table/view
 * @param {string} resourceName The ID of the table or view
 * @param {string} [roleToRemove=null] Optional. Specific role to revoke
 * @param {string} [principalToRemove=null] Optional. Specific principal to revoke access from
 * @returns {Promise<Object>} The updated IAM policy
 */
async function revokeAccessToTableOrView(
  projectId,
  datasetId,
  resourceName,
  roleToRemove = null,
  principalToRemove = null
) {
  // [START bigquery_revoke_access_to_table_or_view]
  // Imports the Google Cloud client library.
  const {BigQuery} = require('@google-cloud/bigquery');

  // TODO (developer): Update and un-comment below lines
  // Google Cloud Platform project.
  // projectId = "my_project_id"

  // Dataset where the table or view is.
  // datasetId = "my_dataset"

  // Table or view name to get the access policy.
  // resourceName = "my_table"

  // (Optional) Role to remove from the table or view.
  // roleToRemove = "roles/bigquery.dataViewer"

  // (Optional) Principal to remove from the table or view.
  // principalToRemove = "user:alice@example.com"

  // Find more information about roles and principals (refered as members) here:
  // https://cloud.google.com/security-command-center/docs/reference/rest/Shared.Types/Binding

  // Instantiate a client.
  const client = new BigQuery();

  // Get the table reference.
  const dataset = client.dataset(datasetId);
  const table = dataset.table(resourceName);

  // Get the IAM access policy for the table or view.
  const [policy] = await table.getIamPolicy();

  // Initialize bindings of they do not exist.
  if (!policy.bindings) {
    policy.bindings = [];
  }

  // To revoke access to a table or view,
  // remove bindings from the Table or View policy.
  //
  // Find more details about Policy objects here:
  // https://cloud.google.com/security-command-center/docs/reference/rest/Shared.Types/Policy

  if (roleToRemove) {
    // Filter out all bindings with the `roleToRemove`
    // and assign a new list back to the policy bindings.
    policy.bindings = policy.bindings.filter(b => b.role !== roleToRemove);
  }

  if (principalToRemove) {
    // The `bindings` list is immutable. Create a copy for modifications.
    const bindings = [...policy.bindings];

    // Filter out the principal from each binding.
    for (const binding of bindings) {
      if (binding.members) {
        binding.members = binding.members.filter(m => m !== principalToRemove);
      }
    }

    // Filter out bindings with empty members.
    policy.bindings = bindings.filter(
      binding => binding.members && binding.members.length > 0
    );
  }

  try {
    // Set the IAM access policy with updated bindings.
    await table.setIamPolicy(policy);

    // Get the policy again to confirm it's set correctly.
    const [verifiedPolicy] = await table.getIamPolicy();

    if (verifiedPolicy && verifiedPolicy.bindings) {
      return verifiedPolicy.bindings;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error settings IAM policy:', error);
    throw error;
  }
  // [END bigquery_revoke_access_to_table_or_view]
}

module.exports = {revokeAccessToTableOrView};
