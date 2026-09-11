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
//  title: Send message to queue using Mutation API
//  usage: node queue-send-with-mutation-api.js <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

async function main(instanceId, databaseId, projectId) {
  // [START spanner_send_to_queue_with_mutation_api]
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
      transaction.queueSend('MyQueue', [1], {
        payload: 'Hello, World!',
      });
      await transaction.commit();
    });

    console.log('Successfully sent message to queue using Mutation API.');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    // Close the database when finished.
    await database.close();
  }
  // [END spanner_send_to_queue_with_mutation_api]
}

main(...process.argv.slice(2));
module.exports = {main};
