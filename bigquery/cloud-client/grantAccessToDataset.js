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
 * Grants access to a BigQuery dataset for a specified entity
 *
 * @param {string} datasetId ID of the dataset to grant access to
 * @param {string} entityId ID of the entity to grant access to
 * @param {string} role Role to grant
 * @returns {Promise<Array>} Array of access entries
 */
async function grantAccessToDataset(datasetId, entityId, role) {
  // [START bigquery_grant_access_to_dataset]
  const {BigQuery} = require('@google-cloud/bigquery');

  // TODO(developer): Update and un-comment below lines

  // ID of the dataset to revoke access to.
  // datasetId = "my_project_id.my_dataset";

  // ID of the user or group from whom you are adding access.
  // Alternatively, the JSON REST API representation of the entity,
  // such as a view's table reference.
  // entityId = "user-or-group-to-add@example.com";

  // One of the "Basic roles for datasets" described here:
  // https://cloud.google.com/bigquery/docs/access-control-basic-roles#dataset-basic-roles
  // role = "READER";

  // Type of entity you are granting access to.
  // Find allowed allowed entity type names here:
  // https://cloud.google.com/python/docs/reference/bigquery/latest/enums#class-googlecloudbigqueryenumsentitytypesvalue
  // In this case, we're using the equivalent of GROUP_BY_EMAIL
  const entityType = 'groupByEmail';

  // Instantiate a client.
  const client = new BigQuery();

  try {
    // Get a reference to the dataset.
    const [dataset] = await client.dataset(datasetId).get();

    // The 'access entries' list is immutable. Create a copy for modifications.
    const entries = Array.isArray(dataset.metadata.access)
      ? [...dataset.metadata.access]
      : [];

    // Append an AccessEntry to grant the role to a dataset.
    // Find more details about the AccessEntry object in the BigQuery documentation
    entries.push({
      role: role,
      [entityType]: entityId,
    });

    // Assign the list of AccessEntries back to the dataset.
    const metadata = {
      access: entries,
    };

    // Update will only succeed if the dataset
    // has not been modified externally since retrieval.
    //
    // See the BigQuery client library documentation for more details on metadata updates

    // Update just the 'access entries' property of the dataset.
    const [updatedDataset] = await client
      .dataset(datasetId)
      .setMetadata(metadata);

    // Show a success message.
    const fullDatasetId =
      updatedDataset &&
      updatedDataset.metadata &&
      updatedDataset.metadata.datasetReference
        ? `${updatedDataset.metadata.datasetReference.projectId}.${updatedDataset.metadata.datasetReference.datasetId}`
        : datasetId;

    console.log(
      `Role '${role}' granted for entity '${entityId}'` +
        ` in dataset '${fullDatasetId}'.`
    );

    return updatedDataset.access;
  } catch (error) {
    if (error.code === 412) {
      // A read-modify-write error (PreconditionFailed equivalent)
      console.error(
        `Dataset '${datasetId}' was modified remotely before this update. ` +
          'Fetch the latest version and retry.'
      );
    } else {
      throw error;
    }
  }
  // [END bigquery_grant_access_to_dataset]
}

module.exports = {
  grantAccessToDataset,
};
