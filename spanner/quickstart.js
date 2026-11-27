// Copyright 2016 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START spanner_quickstart]
const {Spanner} = require('@google-cloud/spanner');

// gRPC status code 5 corresponds to NOT_FOUND.
const GRPC_NOT_FOUND = 5;

/**
 * Executes a basic read-only `SELECT 1` query against a Cloud Spanner database.
 *
 * Precondition: `instanceId` and `databaseId` must exist in `projectId`, and
 * Application Default Credentials must grant `roles/spanner.databaseUser` (or
 * `roles/spanner.databaseReader`).
 *
 * @param {string} projectId Google Cloud project ID (e.g., 'example-project').
 * @param {string} instanceId Spanner instance ID (e.g., 'example-instance').
 * @param {string} databaseId Spanner database ID (e.g., 'example-database').
 * @returns {Promise<void>} Resolves after printing rows and closing the client.
 */
async function quickstart(projectId, instanceId, databaseId) {
  // Pass projectId explicitly when provided; falls back to ambient credentials.
  const spanner = new Spanner(projectId ? {projectId} : {});
  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);

  try {
    const query = {
      sql: 'SELECT 1',
    };

    const [rows] = await database.run(query);

    console.log(`Query successfully executed. ${rows.length} row(s) found.`);
    rows.forEach(row => {
      console.log(`  Row details: ${JSON.stringify(row)}`);
    });
  } catch (err) {
    // Recovery: NOT_FOUND (code 5) -> verify projectId, instanceId, databaseId.
    if (err.code === GRPC_NOT_FOUND) {
      console.error(
        `Resource not found. Verify that instance '${instanceId}' and ` +
          `database '${databaseId}' exist under project '${projectId}'.`
      );
    } else {
      console.error('An unexpected error occurred during execution:', err);
    }
    process.exitCode = 1;
  } finally {
    await database.close();
    spanner.close();
  }
}
// [END spanner_quickstart]

if (require.main === module) {
  quickstart(...process.argv.slice(2));
}

module.exports = {quickstart};
