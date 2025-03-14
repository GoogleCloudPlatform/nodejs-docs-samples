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

async function main(datasetId) {
  // [START bigquery_view_dataset_access_policy]

  /**
   * TODO(developer): Update and un-comment below lines
   */
  // const datasetId = "my_project_id.my_dataset";

  const {BigQuery} = require('@google-cloud/bigquery');

  // Instantiate a client.
  const bigquery = new BigQuery();

  async function viewDatasetAccessPolicy() {
    const dataset = bigquery.dataset(datasetId);

    const [metadata] = await dataset.getMetadata();
    const accessEntries = metadata.access || [];

    // Show the list of AccessEntry objects.
    // More details about the AccessEntry object in the BigQuery documentation:
    // https://cloud.google.com/nodejs/docs/reference/bigquery/latest
    console.log(
      `${accessEntries.length} Access entries in dataset '${datasetId}':`
    );
    for (const accessEntry of accessEntries) {
      console.log(`Role: ${accessEntry.role || 'null'}`);
      console.log(`Special group: ${accessEntry.specialGroup || 'null'}`);
      console.log(`User by Email: ${accessEntry.userByEmail || 'null'}`);
    }
  }
  // [END bigquery_view_dataset_access_policy]
  await viewDatasetAccessPolicy();
}

exports.viewDatasetAccessPolicy = main;
