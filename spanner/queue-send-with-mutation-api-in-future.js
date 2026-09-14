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
//  title: Schedule message to queue for future delivery using Mutation API
//  usage: node queue-send-with-mutation-api-in-future.js <PROJECT_ID> <INSTANCE_ID> <DATABASE_ID>

'use strict';

// [START spanner_send_to_queue_with_mutation_api_in_future]
/**
 * Schedules a message for future delivery to a queue using the Mutation API.
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
    // Schedule delivery for 1 hour in the future
    const deliverTime = new Date(Date.now() + 60 * 60 * 1000);

    await database.runTransactionAsync(async transaction => {
      transaction.queueSend('MyQueue', [3], {
        payload: 'Scheduled message via Mutation API',
        deliverTime: deliverTime,
      });
      await transaction.commit();
    });

    console.log(
      `Successfully scheduled message to queue for ${deliverTime.toISOString()} using Mutation API.`
    );
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    // Close the database when finished.
    await database.close();
  }
}
// [END spanner_send_to_queue_with_mutation_api_in_future]

main(...process.argv.slice(2));
module.exports = {main};
