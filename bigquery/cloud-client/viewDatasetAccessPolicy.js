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
 * View access policies for a BigQuery dataset
 * @param {string} datasetId Dataset ID to view access policies for
 * @returns {Array} List of access entries
 */
function viewDatasetAccessPolicy(datasetId) {
  // [START bigquery_view_dataset_access_policy]
  // Import the Google Cloud client library.
  const {BigQuery} = require('@google-cloud/bigquery');

  // Create a client
  const bigquery = new BigQuery();

  // TODO (developer): Update and un-comment below lines
  // Dataset from which to get the access policy
  // datasetId = "my_dataset";

  // Get a reference to the dataset.
  const dataset = bigquery.dataset(datasetId);

  return dataset.getMetadata().then(([metadata]) => {
    const accessEntries = metadata.access || [];

    // Show the list of AccessEntry objects.
    // More details about the AccessEntry object in the BigQuery documentation
    console.log(
      `${accessEntries.length} Access entries in dataset '${datasetId}':`
    );
    for (const accessEntry of accessEntries) {
      console.log(`Role: ${accessEntry.role || 'null'}`);
      console.log(`Special group: ${accessEntry.specialGroup || 'null'}`);
      console.log(`User by Email: ${accessEntry.userByEmail || 'null'}`);
    }

    return accessEntries;
  });
  // [END bigquery_view_dataset_access_policy]
}

module.exports = {
  viewDatasetAccessPolicy,
};
