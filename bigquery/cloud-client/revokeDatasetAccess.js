// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {BigQuery} = require('@google-cloud/bigquery');

// [START bigquery_revoke_dataset_access]
/**
 * Revokes access to a BigQuery dataset for a specified entity.
 *
 * @param {Object} params The parameters for revoking dataset access
 * @param {string} params.datasetId The ID of the dataset to revoke access from
 * @param {string} params.entityId The ID of the user or group to revoke access from
 * @returns {Promise<Array>} A promise that resolves to the updated access entries
 */
async function revokeDatasetAccess({datasetId, entityId}) {
  // Instantiate a client
  const bigquery = new BigQuery();

  try {
    // Get a reference to the dataset
    const [dataset] = await bigquery.dataset(datasetId).get();

    // Filter out the access entry for the specified entity
    dataset.metadata.access = dataset.metadata.access.filter(
      entry => entry.userByEmail !== entityId && entry.groupByEmail !== entityId
    );

    // Update the dataset with the new access entries
    const [updatedDataset] = await dataset.setMetadata(dataset.metadata);

    console.log(
      `Revoked dataset access for '${entityId}' to dataset '${dataset.id}'.`
    );

    return updatedDataset.metadata.access;
  } catch (error) {
    if (error.code === 412) {
      // Handle precondition failed error (dataset modified externally)
      console.error(
        `Dataset '${datasetId}' was modified remotely before this update. ` +
          'Fetch the latest version and retry.'
      );
    }
    throw error;
  }
}
// [END bigquery_revoke_dataset_access]

module.exports = {
  revokeDatasetAccess,
};
