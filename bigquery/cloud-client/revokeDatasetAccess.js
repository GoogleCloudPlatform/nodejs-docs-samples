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

async function main(datasetId, entityId) {
  // [START bigquery_revoke_dataset_access]

  /**
   * TODO(developer): Update and un-comment below lines
   */

  // const datasetId = "my_project_id.my_dataset"

  // ID of the user or group from whom you are revoking access.
  // const entityId = "user-or-group-to-remove@example.com"

  const {BigQuery} = require('@google-cloud/bigquery');

  // Instantiate a client.
  const bigquery = new BigQuery();

  async function revokeDatasetAccess() {
    const [dataset] = await bigquery.dataset(datasetId).get();

    // To revoke access to a dataset, remove elements from the access list.
    //
    // See the BigQuery client library documentation for more details on access entries:
    // https://cloud.google.com/nodejs/docs/reference/bigquery/latest

    // Filter access entries to exclude entries matching the specified entity_id
    // and assign a new list back to the access list.
    dataset.metadata.access = dataset.metadata.access.filter(entry => {
      return !(
        entry.entity_id === entityId ||
        entry.userByEmail === entityId ||
        entry.groupByEmail === entityId
      );
    });

    // Update will only succeed if the dataset
    // has not been modified externally since retrieval.
    //
    // See the BigQuery client library documentation for more details on metadata updates:
    // https://cloud.google.com/bigquery/docs/updating-datasets

    // Update just the 'access entries' property of the dataset.
    await dataset.setMetadata(dataset.metadata);

    console.log(`Revoked access to '${entityId}' from '${datasetId}'.`);
  }
  // [END bigquery_revoke_dataset_access]
  await revokeDatasetAccess();
}

exports.revokeDatasetAccess = main;
