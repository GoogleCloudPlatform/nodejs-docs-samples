// Copyright 2024 Google LLC
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
//  title: Creates a new index
//  usage: node createIndex <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

async function main(
  instanceId = 'my-instance',
  databaseId = 'my-database',
  projectId = 'my-project-id'
) {
  // [START spanner_create_index]
  // Creates the AlbumsByAlbumTitle secondary index on Albums(AlbumTitle).
  // Precondition: the Albums table must exist, and AlbumsByAlbumTitle must not
  // already exist. `operation.promise()` waits until index backfill completes.
  // Recovery: FAILED_PRECONDITION (code 9) or ALREADY_EXISTS (code 6) -> verify
  // that Albums exists and AlbumsByAlbumTitle does not.

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const projectId = 'my-project-id';

  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  // Creates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  const databaseAdminClient = spanner.getDatabaseAdminClient();

  async function createIndex() {
    const request = ['CREATE INDEX AlbumsByAlbumTitle ON Albums(AlbumTitle)'];

    // Creates a new index in the database
    try {
      const [operation] = await databaseAdminClient.updateDatabaseDdl({
        database: databaseAdminClient.databasePath(
          projectId,
          instanceId,
          databaseId
        ),
        statements: request,
      });

      console.log('Waiting for operation to complete...');
      await operation.promise();

      console.log('Added the AlbumsByAlbumTitle index.');
    } catch (err) {
      console.error('Failed to create index:', err.message || err);
      process.exitCode = 1;
    } finally {
      // Closing the Spanner client automatically closes databaseAdminClient.
      spanner.close();
    }
  }
  await createIndex();
  // [END spanner_create_index]
}

main(...process.argv.slice(2));
