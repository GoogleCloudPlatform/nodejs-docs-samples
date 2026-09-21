// Copyright 2026 Google LLC
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

// sample-metadata:
//  title: Acknowledge message from queue using SQL API
//  usage: node queue-ack-with-sql-api.js <PROJECT_ID> <INSTANCE_ID> <DATABASE_ID>

'use strict';

// [START spanner_ack_queue_message_with_sql_api]
/**
 * Acknowledges a message from a queue using the SQL API.
 *
 * @param {string} projectId - The Google Cloud Project ID.
 * @param {string} instanceId - The Spanner Instance ID.
 * @param {string} databaseId - The Spanner Database ID.
 */
async function main(projectId, instanceId, databaseId) {
  const {Spanner} = require('@google-cloud/spanner');

  const spanner = new Spanner({
    projectId: projectId,
  });

  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);

  try {
    await database.runTransactionAsync(async transaction => {
      // Using ASSERT_ROWS_MODIFIED 1 ensures exactly one message is acknowledged,
      // and returns an OutOfRange error if there is a mismatch.
      const [rowCount] = await transaction.runUpdate({
        sql: 'DELETE FROM MyQueue WHERE Id = @id ASSERT_ROWS_MODIFIED 1',
        params: {
          id: 2,
        },
      });

      console.log(
        `Successfully acknowledged ${rowCount} message using SQL API with ASSERT_ROWS_MODIFIED.`
      );
      await transaction.commit();
    });
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    // Close the database when finished.
    await database.close();
  }
}
// [END spanner_ack_queue_message_with_sql_api]

main(...process.argv.slice(2));
module.exports = {main};
