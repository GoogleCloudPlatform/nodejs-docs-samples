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
 * Grants access to a BigQuery table or view for a specified principal.
 *
 * @param {string} projectId Google Cloud Platform project ID.
 * @param {string} datasetId Dataset where the table or view is.
 * @param {string} resourceName Table or view name to get the access policy.
 * @param {string} principalId The principal requesting access to the table or view.
 * @param {string} role Role to assign to the member.
 * @returns {Promise<object[]>} The updated policy bindings.
 */
async function grantAccessToTableOrView(
  projectId,
  datasetId,
  resourceName,
  principalId,
  role
) {
  // [START bigquery_grant_access_to_table_or_view]
  const {BigQuery} = require('@google-cloud/bigquery');

  // TODO(developer): Update and un-comment below lines.

  // Google Cloud Platform project.
  // projectId = "my_project_id"

  // Dataset where the table or view is.
  // datasetId = "my_dataset_id"

  // Table or view name to get the access policy.
  // resourceName = "my_table_id"

  // The principal requesting access to the table or view.
  // Find more details about principal identifiers here:
  // https://cloud.google.com/iam/docs/principal-identifiers
  // principalId = "user:bob@example.com"

  // Role to assign to the member.
  // role = "roles/bigquery.dataViewer"

  // Instantiate a client.
  const client = new BigQuery();

  // Get the table reference.
  const dataset = client.dataset(datasetId);
  const table = dataset.table(resourceName);

  // Get the IAM access policy for the table or view.
  const [policy] = await table.getIamPolicy();

  // Initialize bindings if they do not exist.
  if (!policy.bindings) {
    policy.bindings = [];
  }

  // To grant access to a table or view
  // add bindings to the Table or View policy.
  //
  // Find more details about Policy and Binding objects here:
  // https://cloud.google.com/security-command-center/docs/reference/rest/Shared.Types/Policy
  // https://cloud.google.com/security-command-center/docs/reference/rest/Shared.Types/Binding
  const binding = {
    role: role,
    members: [principalId],
  };
  policy.bindings.push(binding);

  // Set the IAM access policy with updated bindings.
  const [updatedPolicy] = await table.setIamPolicy(policy);

  // Show a success message.
  console.log(
    `Role '${role}' granted for principal '${principalId}' on resource '${datasetId}.${resourceName}'.`
  );
  // [END bigquery_grant_access_to_table_or_view]
  return updatedPolicy.bindings;
}

module.exports = {grantAccessToTableOrView};
