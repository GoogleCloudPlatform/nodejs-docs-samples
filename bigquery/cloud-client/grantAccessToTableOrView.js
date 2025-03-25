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

async function main(projectId, datasetId, tableId, principalId, role) {
  // [START bigquery_grant_access_to_table_or_view]

  /**
   * TODO(developer): Update and un-comment below lines
   */
  // const projectId = "YOUR_PROJECT_ID";
  // const datasetId = "YOUR_DATASET_ID";
  // const tableId = "YOUR_TABLE_ID";
  // const principalId = "YOUR_PRINCIPAL_ID";
  // const role = "YOUR_ROLE";

  const {BigQuery} = require('@google-cloud/bigquery');

  // Instantiate a client.
  const client = new BigQuery();

  async function grantAccessToTableOrView() {
    const dataset = client.dataset(datasetId);
    const table = dataset.table(tableId);

    // Get the IAM access policy for the table or view.
    const [policy] = await table.getIamPolicy();

    // Initialize bindings array.
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
      role,
      members: [principalId],
    };
    policy.bindings.push(binding);

    // Set the IAM access policy with updated bindings.
    await table.setIamPolicy(policy);

    // Show a success message.
    console.log(
      `Role '${role}' granted for principal '${principalId}' on resource '${datasetId}.${tableId}'.`
    );
  }

  await grantAccessToTableOrView();
  // [END bigquery_grant_access_to_table_or_view]
}

exports.grantAccessToTableOrView = main;
