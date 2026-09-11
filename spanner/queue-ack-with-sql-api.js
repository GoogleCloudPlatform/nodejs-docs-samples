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
//  usage: node queue-ack-with-sql-api.js <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

async function main(instanceId, databaseId, projectId) {
  // [START spanner_ack_queue_message_with_sql_api]
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'my-project-id';
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Creates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  // Gets a reference to a Cloud Spanner instance and database
  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);

  try {
    await database.runTransactionAsync(async transaction => {
      // Using ASSERT_ROWS_MODIFIED 1 ensures exactly one message is acknowledged,
      // and aborts the transaction if the message does not exist or was already acknowledged.
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
  // [END spanner_ack_queue_message_with_sql_api]
}

main(...process.argv.slice(2));
module.exports = {main};
