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

const {BigQuery} = require('@google-cloud/bigquery');

/**
 * Grants access to a BigQuery table or view for a specified principal.
 *
 * @param {string} projectId - Google Cloud Platform project ID
 * @param {string} datasetId - Dataset where the table or view is
 * @param {string} resourceName - Table or view name to get the access policy
 * @param {string} principalId - The principal requesting access to the table or view
 * @param {string} role - Role to assign to the member
 * @returns {Promise<object[]>} The updated policy bindings
 */
async function grantAccessToTableOrView({
  projectId,
  datasetId,
  resourceName,
  principalId,
  role,
}) {
  // [START bigquery_grant_access_to_table_or_view]
  // Uncomment and update these variables:
  // const projectId = 'my_project_id';
  // const datasetId = 'my_dataset';
  // const resourceName = 'my_table';
  // const principalId = 'user:bob@example.com';
  // const role = 'roles/bigquery.dataViewer';

  // Create a BigQuery client
  const bigquery = new BigQuery();

  // Get the dataset and table references
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(resourceName);

  try {
    // Get the IAM access policy for the table or view
    const [policy] = await table.iam.getPolicy();

    // Create a new binding for the principal and role
    const binding = {
      role: role,
      members: [principalId],
    };

    // Add the new binding to the policy
    policy.bindings.push(binding);

    // Set the updated IAM access policy
    const [updatedPolicy] = await table.iam.setPolicy(policy);

    console.log(
      `Role '${role}' granted for principal '${principalId}' on resource '${projectId}.${datasetId}.${resourceName}'.`
    );

    return updatedPolicy.bindings;
  } catch (error) {
    console.error('Error granting access:', error);
    throw error;
  }
  // [END bigquery_grant_access_to_table_or_view]
}

module.exports = {
  grantAccessToTableOrView,
};
