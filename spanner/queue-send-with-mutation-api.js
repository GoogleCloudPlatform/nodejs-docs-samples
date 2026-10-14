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
//  usage: node queue-send-with-mutation-api.js <PROJECT_ID> <INSTANCE_ID> <DATABASE_ID>

'use strict';

// [START spanner_send_to_queue_with_mutation_api]
/**
 * Sends a message to a queue using the Mutation API.
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
}
// [END spanner_send_to_queue_with_mutation_api]

main(...process.argv.slice(2));
module.exports = {main};
