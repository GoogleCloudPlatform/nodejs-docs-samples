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

async function main(projectId, datasetId, resourceName) {
  // [START bigquery_view_table_or_view_access_policy]

  /**
   * TODO(developer): Update and un-comment below lines
   */
  // const projectId = "YOUR_PROJECT_ID"
  // const datasetId = "YOUR_DATASET_ID"
  // const resourceName = "YOUR_RESOURCE_NAME";

  const {BigQuery} = require('@google-cloud/bigquery');

  // Instantiate a client.
  const client = new BigQuery();

  async function viewTableOrViewAccessPolicy() {
    const dataset = client.dataset(datasetId);
    const table = dataset.table(resourceName);

    // Get the IAM access policy for the table or view.
    const [policy] = await table.getIamPolicy();

    // Initialize bindings if they don't exist
    if (!policy.bindings) {
      policy.bindings = [];
    }

    // Show policy details.
    // Find more details for the Policy object here:
    // https://cloud.google.com/bigquery/docs/reference/rest/v2/Policy
    console.log(`Access Policy details for table or view '${resourceName}'.`);
    console.log(`Bindings: ${JSON.stringify(policy.bindings, null, 2)}`);
    console.log(`etag: ${policy.etag}`);
    console.log(`Version: ${policy.version}`);
  }
  // [END bigquery_view_table_or_view_access_policy]
  await viewTableOrViewAccessPolicy();
}

exports.viewTableOrViewAccessPolicy = main;
