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

// [START bigquery_view_dataset_access_policy]
/**
 * View access policies for a BigQuery dataset
 *
 * @param {object} [overrideValues] Optional parameters to override defaults
 * @param {string} [overrideValues.datasetId] Dataset ID to view access policies
 */
async function viewDatasetAccessPolicy(overrideValues = {}) {
  // Instantiate BigQuery client
  const bigquery = new BigQuery();

  // Dataset from which to get the access policy
  const datasetId = overrideValues.datasetId || 'my_new_dataset';

  try {
    // Prepares a reference to the dataset
    const dataset = bigquery.dataset(datasetId);
    const [metadata] = await dataset.getMetadata();

    // Shows the Access policy as a list of access entries
    console.log('Access entries:', metadata.access);

    // Get properties for an AccessEntry
    if (metadata.access && metadata.access.length > 0) {
      console.log(`Details for Access entry 0 in dataset '${datasetId}':`);
      console.log(`Role: ${metadata.access[0].role || 'N/A'}`);
      console.log(`SpecialGroup: ${metadata.access[0].specialGroup || 'N/A'}`);
      console.log(`UserByEmail: ${metadata.access[0].userByEmail || 'N/A'}`);
    }
  } catch (error) {
    console.error(`Error viewing dataset access policy: ${error.message}`);
    throw error;
  }
}
// [END bigquery_view_dataset_access_policy]

module.exports = {
  viewDatasetAccessPolicy,
};
