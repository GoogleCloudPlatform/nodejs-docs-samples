// Copyright 2022 Google LLC
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
//  title: Update using DML returning.
//  usage: node dml-returning-update.js <INSTANCE_ID> <DATABASE_ID> <PROJECT_ID>

'use strict';

async function main(instanceId, databaseId, projectId) {
  // [START spanner_update_dml_returning]
  // Imports the Google Cloud client library.
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

  async function updateUsingDmlReturning(instanceId, databaseId) {
    // Gets a reference to a Cloud Spanner instance and database.
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    try {
      await database.runTransactionAsync(async transaction => {
        const [rows, stats] = await transaction.run({
          sql: 'UPDATE Albums SET MarketingBudget = 2000000 WHERE SingerId = 1 and AlbumId = 1 THEN RETURN MarketingBudget',
        });

        const rowCount = Number(stats.rowCountExact);
        console.log(
          `Successfully updated ${rowCount} record into the Albums table.`
        );
        rows.forEach(row => {
          console.log(row.toJSON().MarketingBudget);
        });

        await transaction.commit();
      });
    } catch (err) {
      console.error('ERROR:', err);
    } finally {
      // Close the database when finished.
      await database.close();
    }
  }
  await updateUsingDmlReturning(instanceId, databaseId);
  // [END spanner_update_dml_returning]
}

main(...process.argv.slice(2));
