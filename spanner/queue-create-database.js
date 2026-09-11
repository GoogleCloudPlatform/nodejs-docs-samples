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

'use strict';

async function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_create_database_with_queue]
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

  // Gets a reference to a Cloud Spanner Database Admin Client object
  const databaseAdminClient = spanner.getDatabaseAdminClient();

  const createQueueStatement = `
    CREATE QUEUE MyQueue (
      Id INT64 NOT NULL,
      Payload STRING(MAX) NOT NULL
    ) PRIMARY KEY (Id)`;

  try {
    const [operation] = await databaseAdminClient.createDatabase({
      createStatement: 'CREATE DATABASE `' + databaseId + '`',
      extraStatements: [createQueueStatement],
      parent: databaseAdminClient.instancePath(projectId, instanceId),
    });

    console.log(`Waiting for creation of ${databaseId} to complete...`);
    await operation.promise();

    console.log(`Created database ${databaseId} with queue MyQueue.`);
  } catch (err) {
    console.error('ERROR:', err);
  }
  // [END spanner_create_database_with_queue]
}

main(...process.argv.slice(2));
module.exports = {main};
