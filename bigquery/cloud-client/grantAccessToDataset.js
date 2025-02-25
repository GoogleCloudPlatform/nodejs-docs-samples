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
 * Grants access to a BigQuery dataset for a specified entity
 *
 * @param {object} options The configuration object
 * @param {string} options.datasetId ID of the dataset to grant access to (e.g. "my_project_id.my_dataset")
 * @param {string} options.entityId ID of the user or group to grant access to (e.g. "user-or-group-to-add@example.com")
 * @param {string} options.role One of the basic roles for datasets (e.g. "READER")
 * @returns {Promise<Array>} Array of access entries
 */
// [START bigquery_grant_access_to_dataset]
async function grantAccessToDataset(options) {
  // Create a BigQuery client
  const bigquery = new BigQuery();

  const {datasetId, entityId, role} = options;

  try {
    // Get a reference to the dataset
    const dataset = bigquery.dataset(datasetId);
    const [metadata] = await dataset.getMetadata();

    // The access entries list is immutable. Create a copy for modifications
    const entries = [...(metadata.access || [])];

    // Add the new access entry
    entries.push({
      role: role,
      groupByEmail: entityId, // For group access. Use userByEmail for user access
    });

    // Update the dataset's access entries
    const [updatedMetadata] = await dataset.setMetadata({
      ...metadata,
      access: entries,
    });

    console.log(
      `Role '${role}' granted for entity '${entityId}' in dataset '${datasetId}'.`
    );

    return updatedMetadata.access;
  } catch (error) {
    if (error.code === 412) {
      // 412 Precondition Failed - Dataset was modified between get and update
      console.error(
        `Dataset '${datasetId}' was modified remotely before this update. ` +
          'Fetch the latest version and retry.'
      );
    }
    throw error;
  }
}
// [END bigquery_grant_access_to_dataset]

module.exports = {
  grantAccessToDataset,
};
