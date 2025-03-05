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
 * View access policy for a BigQuery table or view
 *
 * @param {string} projectId Google Cloud Platform project
 * @param {string} datasetId Dataset where the table or view is
 * @param {string} resourceName Table or view name to get the access policy
 * @returns {Promise<object>} The IAM policy object
 */
async function viewTableOrViewAccessPolicy(projectId, datasetId, resourceName) {
  // [START bigquery_view_table_or_view_access_policy]
  // Imports the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  // TODO(developer): Update and un-comment below lines
  // Google Cloud Platform project.
  // projectId = "my_project_id";
  // Dataset where the table or view is.
  // datasetId = "my_dataset_id";
  // Table or view name to get the access policy.
  // resourceName = "my_table_name_id";

  // Instantiate a client.
  const client = new BigQuery();

  // Get the table reference.
  const dataset = client.dataset(datasetId);
  const table = dataset.table(resourceName);

  // Get the IAM access policy for the table or view.
  const [policy] = await table.getIamPolicy();

  // Initialize bindings if they don't exist.
  if (!policy.bindings) {
    policy.bindings = [];
  }

  // Show policy details
  // Find more details for the Policy object here:
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/Policy
  console.log(`Access Policy details for table or view '${resourceName}'.`);
  console.log(`Bindings: ${JSON.stringify(policy.bindings, null, 2)}`);
  console.log(`etag: ${policy.etag}`);
  console.log(`Version: ${policy.version}`);

  return policy;
}
// [END bigquery_view_table_or_view_access_policy]

module.exports = viewTableOrViewAccessPolicy;
