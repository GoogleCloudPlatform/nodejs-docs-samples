// Copyright 2025 Google LLC
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

/**
 * Revokes access to a dataset for a specified entity.
 *
 * @param {string} datasetId ID of the dataset to revoke access to.
 * @param {string} entityId  ID of the user or group from whom you are revoking access.
 *                            Alternatively, the JSON REST API representation of the entity,
 *                            such as a view's table reference.
 * @returns {Promise<Array>} A promise that resolves to the updated access entries.
 */
async function revokeDatasetAccess(datasetId, entityId) {
  // [START bigquery_revoke_dataset_access]
  const {BigQuery} = require('@google-cloud/bigquery');

  // Define enum for HTTP codes.
  const HTTP_STATUS = {
    PRECONDITION_FAILED: 412,
  };

  // TODO (developer): Update and un-comment below lines.

  // ID of the dataset to revoke access to.
  // datasetId = "my_project.my_dataset"

  // ID of the user or group from whom you are revoking access.
  // Alternatively, the JSON REST API representation of the entity,
  // such as a view's table reference.
  // entityId = "user-or-group-to-remove@example.com"

  // Instantiate a client.
  const bigquery = new BigQuery();

  // Get a reference to the dataset.
  const [dataset] = await bigquery.dataset(datasetId).get();

  // To revoke access to a dataset, remove elements from the access array.
  //
  // See the BigQuery client library documentation for more details on access entries:
  // https://cloud.google.com/nodejs/docs/reference/secret-manager/4.1.4

  // Filter access entries to exclude entries matching the specified entity_id
  // and assign a new array back to the access array.
  dataset.metadata.access = dataset.metadata.access.filter(entry => {
    // Return false (remove entry) if any of these fields match entityId.
    return !(
      entry.entity_id === entityId ||
      entry.userByEmail === entityId ||
      entry.groupByEmail === entityId
    );
  });

  // Update will only succeed if the dataset
  // has not been modified externally since retrieval.

  try {
    // Update just the access entries property of the dataset.
    const [updatedDataset] = await dataset.setMetadata(dataset.metadata);

    return updatedDataset.access;
  } catch (error) {
    // Check if it's a precondition failed error (a read-modify-write error).
    if (error.code === HTTP_STATUS.PRECONDITION_FAILED) {
      console.log(
        `Dataset '${dataset.id}' was modified remotely before this update. ` +
          'Fetch the latest version and retry.'
      );
    } else {
      throw error;
    }
  }
  // [END bigquery_revoke_dataset_access]
}

module.exports = {
  revokeDatasetAccess,
};
