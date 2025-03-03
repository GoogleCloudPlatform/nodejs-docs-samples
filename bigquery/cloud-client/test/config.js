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

const {BigQuery} = require('@google-cloud/bigquery');
const crypto = require('crypto');

// Define enum for HTTP codes
const HTTP_STATUS = {
  NOT_FOUND: 404,
};

// Generate a unique prefix using a random UUID to ensure uniqueness across test runs
function createRandomPrefix() {
  return `nodejs_test_${crypto.randomUUID().replace(/-/g, '').substring(0, 8)}`;
}

const PREFIX = createRandomPrefix();
console.log(`Generated test prefix: ${PREFIX}`);

const ENTITY_ID = 'cloud-developer-relations@google.com'; // Group account
const DATASET_ID = `${PREFIX}_cloud_client`;
const TABLE_NAME = `${PREFIX}_table`;
const VIEW_NAME = `${PREFIX}_view`;

// Shared client for all tests
let sharedClient = null;
let sharedProjectId = null;
let sharedDataset = null;
let sharedTable = null;
let sharedView = null;
let resourcesCreated = false;

// Helper functions to get shared resources
const getClient = async () => {
  if (!sharedClient) {
    sharedClient = new BigQuery();
  }
  return sharedClient;
};

const getProjectId = async () => {
  if (!sharedProjectId) {
    const client = await getClient();
    sharedProjectId = client.projectId;
  }
  return sharedProjectId;
};

const getEntityId = () => ENTITY_ID;

const getDataset = async () => {
  try {
    if (!sharedDataset) {
      const client = await getClient();

      try {
        // First try to get the dataset if it exists
        console.log(`Checking for dataset ${DATASET_ID}`);
        [sharedDataset] = await client.dataset(DATASET_ID).get();
        console.log(`Using existing dataset: ${DATASET_ID}`);
      } catch (err) {
        if (err.code === HTTP_STATUS.NOT_FOUND) {
          // If dataset doesn't exist, create it
          console.log(`Creating dataset: ${DATASET_ID}...`);
          [sharedDataset] = await client.createDataset(DATASET_ID);
          resourcesCreated = true;
          console.log(`Created dataset: ${DATASET_ID}`);
        } else {
          console.error(`Error getting dataset: ${err.message}`);
          throw err;
        }
      }
    }
    return sharedDataset;
  } catch (err) {
    console.error(`Error in getDataset: ${err.message}`);
    throw err;
  }
};

const getTable = async () => {
  try {
    if (!sharedTable) {
      const client = await getClient();

      const sample_schema = [{name: 'id', type: 'INTEGER', mode: 'REQUIRED'}];
      const tableOptions = {
        schema: sample_schema,
      };

      try {
        // Try to get table if it exists
        console.log(`Checking for table ${TABLE_NAME}`);
        [sharedTable] = await client
          .dataset(DATASET_ID)
          .table(TABLE_NAME)
          .get();
        console.log(`Using existing table: ${TABLE_NAME}`);
      } catch (err) {
        if (err.code === HTTP_STATUS.NOT_FOUND) {
          // If table doesn't exist, create it
          console.log(`Creating table: ${TABLE_NAME}...`);
          [sharedTable] = await client
            .dataset(DATASET_ID)
            .createTable(TABLE_NAME, tableOptions);
          resourcesCreated = true;
          console.log(`Created table: ${TABLE_NAME}`);
        } else {
          console.error(`Error getting table: ${err.message}`);
          throw err;
        }
      }
    }
    return sharedTable;
  } catch (err) {
    console.error(`Error in getTable: ${err.message}`);
    throw err;
  }
};
const getView = async () => {
  try {
    if (!sharedView) {
      const client = await getClient();
      const projectId = await getProjectId();

      const viewOptions = {
        view: {
          query: `SELECT * FROM \`${projectId}.${DATASET_ID}.${TABLE_NAME}\``,
          useLegacySql: false,
        },
      };

      try {
        // Try to get view if it exists
        console.log(`Checking for view ${VIEW_NAME}`);
        [sharedView] = await client.dataset(DATASET_ID).table(VIEW_NAME).get();
        console.log(`Using existing view: ${VIEW_NAME}`);
      } catch (err) {
        if (err.code === HTTP_STATUS.NOT_FOUND) {
          // If view doesn't exist, create it
          console.log(`Creating view: ${VIEW_NAME}...`);
          [sharedView] = await client
            .dataset(DATASET_ID)
            .createTable(VIEW_NAME, viewOptions);
          resourcesCreated = true;
          console.log(`Created view: ${VIEW_NAME}`);
        } else {
          console.error(`Error getting view: ${err.message}`);
          throw err;
        }
      }
    }
    return sharedView;
  } catch (err) {
    console.error(`Error in getView: ${err.message}`);
    throw err;
  }
};

// Setup and teardown functions for test suites
const setupBeforeAll = async () => {
  console.log('=== Setting up test resources ===');
  try {
    await getClient();
    await getProjectId();
    // Initialize dataset, table, and view
    await getDataset();
    await getTable();
    await getView();
    console.log('=== Test setup complete ===');
  } catch (err) {
    console.error(`Setup failed: ${err.message}`);
    throw err;
  }
};

const cleanupResources = async () => {
  console.log('=== Cleaning up test resources ===');

  if (sharedClient) {
    try {
      // Check if resources exist before attempting to delete
      if (sharedDataset) {
        try {
          console.log(
            `Deleting dataset: ${DATASET_ID} and all contained tables/views`
          );
          await sharedClient.dataset(DATASET_ID).delete({force: true});
          console.log(`Successfully deleted dataset: ${DATASET_ID}`);
        } catch (err) {
          if (err.code !== HTTP_STATUS.NOT_FOUND) {
            console.error(`Error deleting dataset: ${err.message}`);
          } else {
            console.log(`Dataset ${DATASET_ID} already deleted or not found`);
          }
        }
      }
    } catch (err) {
      console.error(`Cleanup error: ${err.message}`);
    }
  }

  // Reset all shared resources
  sharedClient = null;
  sharedProjectId = null;
  sharedDataset = null;
  sharedTable = null;
  sharedView = null;
  resourcesCreated = false;

  console.log('=== Cleanup complete ===');
};

const teardownAfterAll = async () => {
  // Always clean up resources after tests
  await cleanupResources();
};

// Cleanup on process exit or termination
process.on('exit', () => {
  if (resourcesCreated) {
    console.log('Process exiting, cleaning up BigQuery resources...');
  }
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up before exit...');
  await cleanupResources();
});

process.on('uncaughtException', async err => {
  console.error('Uncaught exception:', err);
  await cleanupResources();
});

module.exports = {
  PREFIX,
  ENTITY_ID,
  DATASET_ID,
  TABLE_NAME,
  VIEW_NAME,
  getClient,
  getProjectId,
  getEntityId,
  getDataset,
  getTable,
  getView,
  setupBeforeAll,
  teardownAfterAll,
  cleanupResources,
};
