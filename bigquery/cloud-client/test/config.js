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

const uuid = require('uuid');
const {BigQuery} = require('@google-cloud/bigquery');

// Setup and teardown functions for test suites
const setupBeforeAll = async () => {
  const prefix = `nodejs_test_${uuid.v4().replace(/-/g, '').substring(0, 8)}`;
  const entityId = 'example-analyst-group@google.com'; // Group account
  const datasetId = `${prefix}_cloud_client`;
  const tableName = `${prefix}_table`;
  const viewName = `${prefix}_view`;

  const client = new BigQuery();
  await client
    .createDataset(datasetId)
    .then(() => {
      return client.dataset(datasetId).createTable(tableName);
    })
    .catch(err => {
      console.error(`Error creating table: ${err.message}`);
    });

  return {
    datasetId: datasetId,
    tableId: tableName,
    viewId: viewName,
    entityId: entityId,
  };
};

const cleanupResources = async datasetId => {
  const client = new BigQuery();
  await client.dataset(datasetId).delete({deleteContents: true, force: true});
};

module.exports = {
  setupBeforeAll,
  cleanupResources,
};
