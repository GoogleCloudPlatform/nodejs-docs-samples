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

async function main(datasetId, entityId, role) {
  // [START bigquery_grant_access_to_dataset]

  /**
   * TODO(developer): Update and un-comment below lines.
   */

  // const datasetId = "my_project_id.my_dataset_name";

  // ID of the user or group from whom you are adding access.
  // const entityId = "user-or-group-to-add@example.com";

  // One of the "Basic roles for datasets" described here:
  // https://cloud.google.com/bigquery/docs/access-control-basic-roles#dataset-basic-roles
  // const role = "READER";

  const {BigQuery} = require('@google-cloud/bigquery');

  // Instantiate a client.
  const client = new BigQuery();

  // Type of entity you are granting access to.
  // Find allowed allowed entity type names here:
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/datasets#resource:-dataset
  const entityType = 'groupByEmail';

  async function grantAccessToDataset() {
    const [dataset] = await client.dataset(datasetId).get();

    // The 'access entries' array is immutable. Create a copy for modifications.
    const entries = [...dataset.metadata.access];

    // Append an AccessEntry to grant the role to a dataset.
    // Find more details about the AccessEntry object in the BigQuery documentation:
    // https://cloud.google.com/python/docs/reference/bigquery/latest/google.cloud.bigquery.dataset.AccessEntry
    entries.push({
      role,
      [entityType]: entityId,
    });

    // Assign the array of AccessEntries back to the dataset.
    const metadata = {
      access: entries,
    };

    // Update will only succeed if the dataset
    // has not been modified externally since retrieval.
    //
    // See the BigQuery client library documentation for more details on metadata updates:
    // https://cloud.google.com/nodejs/docs/reference/bigquery/latest

    // Update just the 'access entries' property of the dataset.
    await client.dataset(datasetId).setMetadata(metadata);

    console.log(
      `Role '${role}' granted for entity '${entityId}' in '${datasetId}'.`
    );
  }
  // [END bigquery_grant_access_to_dataset]
  await grantAccessToDataset();
}

exports.grantAccessToDataset = main;
