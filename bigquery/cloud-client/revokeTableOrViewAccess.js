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

async function main(
  projectId,
  datasetId,
  tableId,
  roleToRemove = null,
  principalToRemove = null
) {
  // [START bigquery_revoke_access_to_table_or_view]

  /**
   * TODO(developer): Update and un-comment below lines
   */
  // const projectId = "YOUR_PROJECT_ID"
  // const datasetId = "YOUR_DATASET_ID"
  // const tableId = "YOUR_TABLE_ID"
  // const roleToRemove = "YOUR_ROLE"
  // const principalToRemove = "YOUR_PRINCIPAL_ID"

  const {BigQuery} = require('@google-cloud/bigquery');

  // Instantiate a client.
  const client = new BigQuery();

  async function revokeAccessToTableOrView() {
    const dataset = client.dataset(datasetId);
    const table = dataset.table(tableId);

    // Get the IAM access policy for the table or view.
    const [policy] = await table.getIamPolicy();

    // Initialize bindings array.
    if (!policy.bindings) {
      policy.bindings = [];
    }

    // To revoke access to a table or view,
    // remove bindings from the Table or View policy.
    //
    // Find more details about Policy objects here:
    // https://cloud.google.com/security-command-center/docs/reference/rest/Shared.Types/Policy

    if (principalToRemove) {
      // Create a copy of bindings for modifications.
      const bindings = [...policy.bindings];

      // Filter out the principal from each binding.
      for (const binding of bindings) {
        if (binding.members) {
          binding.members = binding.members.filter(
            m => m !== principalToRemove
          );
        }
      }

      // Filter out bindings with empty members.
      policy.bindings = bindings.filter(
        binding => binding.members && binding.members.length > 0
      );
    }

    if (roleToRemove) {
      // Filter out all bindings with the roleToRemove
      // and assign a new list back to the policy bindings.
      policy.bindings = policy.bindings.filter(b => b.role !== roleToRemove);
    }

    // Set the IAM access policy with updated bindings.
    await table.setIamPolicy(policy);

    // Both role and principal are removed
    if (roleToRemove !== null && principalToRemove !== null) {
      console.log(
        `Role '${roleToRemove}' revoked for principal '${principalToRemove}' on resource '${datasetId}.${tableId}'.`
      );
    }

    // Only role is removed
    if (roleToRemove !== null && principalToRemove === null) {
      console.log(
        `Role '${roleToRemove}' revoked for all principals on resource '${datasetId}.${tableId}'.`
      );
    }

    // Only principal is removed
    if (roleToRemove === null && principalToRemove !== null) {
      console.log(
        `Access revoked for principal '${principalToRemove}' on resource '${datasetId}.${tableId}'.`
      );
    }

    // No changes were made
    if (roleToRemove === null && principalToRemove === null) {
      console.log(
        `No changes made to access policy for '${datasetId}.${tableId}'.`
      );
    }
  }
  // [END bigquery_revoke_access_to_table_or_view]
  await revokeAccessToTableOrView();
}

exports.revokeAccessToTableOrView = main;
