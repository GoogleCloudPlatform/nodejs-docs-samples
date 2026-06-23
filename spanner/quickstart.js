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
const {status} = require('@grpc/grpc-js');

// Creates a client using the ambient project ID or environment configuration
const spanner = new Spanner();

/**
 * Executes a query against a Cloud Spanner database.
 *
 * @param {string} projectId The project ID containing the Spanner instance (for example, 'example-project-id').
 * @param {string} instanceId The ID of the Spanner instance (for example, 'example-instance').
 * @param {string} databaseId The ID of the Spanner database (for example 'example-database').
 */
async function quickstart(projectId, instanceId, databaseId) {
  try {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const query = {
      sql: 'SELECT 1',
    };

    const [rows] = await database.run(query);

    console.log(`Query successfully executed. ${rows.length} row(s) found.`);
    rows.forEach(row => {
      console.log(`  Row details: ${JSON.stringify(row)}`);
    });
  } catch (err) {
    if (err.code === status.NOT_FOUND) {
      console.error(
        `Resource not found. Please verify that instance '${instanceId}' and database '${databaseId}' exist under project '${projectId}'.`
      );
    } else {
      console.error('An unexpected error occurred during execution:', err);
    }
  }
}
// [END spanner_quickstart]

if (require.main === module) {
  quickstart(...process.argv.slice(2));
}

module.exports = {quickstart};
