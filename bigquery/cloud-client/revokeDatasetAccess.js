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
 * Revokes access to a dataset for a specified entity.
 *
 * @param {string} datasetId - ID of the dataset to revoke access to.
 * @param {string} entityId - ID of the user or group from whom you are revoking access.
 *                            Alternatively, the JSON REST API representation of the entity,
 *                            such as a view's table reference.
 * @returns {Promise<Array>} A promise that resolves to the updated access entries
 */
async function revokeDatasetAccess(datasetId, entityId) {
  // Import the Google Cloud client library.
  const bigquery = new BigQuery();

  // TODO (developer): Update and un-comment below lines

  // ID of the dataset to revoke access to.
  // datasetId = "your-project.your_dataset"

  // ID of the user or group from whom you are revoking access.
  // Alternatively, the JSON REST API representation of the entity,
  // such as a view's table reference.
  // entityId = "user-or-group-to-remove@example.com"

  // Get a reference to the dataset.
  const [dataset] = await bigquery.dataset(datasetId).get();

  // To revoke access to a dataset, remove elements from the access list.
  //
  // See the BigQuery client library documentation for more details on access entries

  // Filter access entries to exclude entries matching the specified entity_id
  // and assign a new list back to the access list.
  dataset.metadata.access = dataset.metadata.access.filter(entry => {
    // Check for entity_id (specific match)
    if (entry.entity_id === entityId) {
      console.log(
        `Found matching entity_id: ${entry.entity_id}, removing entry`
      );
      return false;
    }

    // Check for userByEmail field
    if (entry.userByEmail === entityId) {
      console.log(
        `Found matching userByEmail: ${entry.userByEmail}, removing entry`
      );
      return false;
    }

    // Check for groupByEmail field
    if (entry.groupByEmail === entityId) {
      console.log(
        `Found matching groupByEmail: ${entry.groupByEmail}, removing entry`
      );
      return false;
    }

    // Keep all other entries
    return true;
  });

  // Update will only succeed if the dataset
  // has not been modified externally since retrieval.

  try {
    // Update just the access entries property of the dataset.
    const [updatedDataset] = await dataset.setMetadata(dataset.metadata);

    const fullDatasetId = `${dataset.parent.projectId}.${dataset.id}`;
    console.log(
      `Revoked dataset access for '${entityId}' to dataset '${fullDatasetId}'.`
    );

    return updatedDataset.access;
  } catch (error) {
    // Check if it's a precondition failed error (a read-modify-write error)
    if (error.code === 412) {
      console.log(
        `Dataset '${dataset.id}' was modified remotely before this update. ` +
          'Fetch the latest version and retry.'
      );
    } else {
      throw error;
    }
  }
}
// [END bigquery_revoke_dataset_access]

module.exports = {
  revokeDatasetAccess,
};
