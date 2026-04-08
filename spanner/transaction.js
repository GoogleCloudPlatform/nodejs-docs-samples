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

async function readOnlyTransaction(instanceId, databaseId, projectId) {
  // [START spanner_read_only_transaction]
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
  let database;
  try {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    database = instance.database(databaseId);

    // Gets a transaction object that captures the database state
    // at a specific point in time
    const [transaction] = await database.getSnapshot();

    try {
      const queryOne = 'SELECT SingerId, AlbumId, AlbumTitle FROM Albums';

      // Read #1, using SQL
      const [qOneRows] = await transaction.run(queryOne);

      qOneRows.forEach(row => {
        const json = row.toJSON();
        console.log(
          `SingerId: ${json.SingerId}, AlbumId: ${json.AlbumId}, AlbumTitle: ${json.AlbumTitle}`
        );
      });

      const queryTwo = {
        columns: ['SingerId', 'AlbumId', 'AlbumTitle'],
      };

      // Read #2, using the `read` method. Even if changes occur
      // in-between the reads, the transaction ensures that both
      // return the same data.
      const [qTwoRows] = await transaction.read('Albums', queryTwo);

      qTwoRows.forEach(row => {
        const json = row.toJSON();
        console.log(
          `SingerId: ${json.SingerId}, AlbumId: ${json.AlbumId}, AlbumTitle: ${json.AlbumTitle}`
        );
      });

      console.log('Successfully executed read-only transaction.');
    } finally {
      // Ensure the transaction is released
      transaction.end();
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    // Close the database when finished.
    await database.close();
  }
  // [END spanner_read_only_transaction]
}

async function readWriteTransaction(instanceId, databaseId, projectId) {
  // [START spanner_read_write_transaction]
  // This sample transfers 200,000 from the MarketingBudget field
  // of the second Album to the first Album, as long as the second
  // Album has enough money in its budget. Make sure to run the
  // addColumn and updateData samples first (in that order).

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

  let database;
  const transferAmount = 200000;

  try {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    database = instance.database(databaseId);

    await database.runTransactionAsync(async transaction => {
      let firstBudget, secondBudget;
      const queryOne = {
        columns: ['MarketingBudget'],
        keys: [[2, 2]], // SingerId: 2, AlbumId: 2
      };

      const queryTwo = {
        columns: ['MarketingBudget'],
        keys: [[1, 1]], // SingerId: 1, AlbumId: 1
      };

      // Reads the second album's budget
      const [resultsOne] = await transaction.read('Albums', queryOne);
      const rowsOne = resultsOne.map(row => row.toJSON());
      secondBudget = rowsOne[0].MarketingBudget;
      console.log(`The second album's marketing budget: ${secondBudget}`);

      // Makes sure the second album's budget is large enough
      if (secondBudget < transferAmount) {
        throw new Error(
          `The second album's budget (${secondBudget}) is less than the transfer amount (${transferAmount}).`
        );
      }

      // Reads the first album's budget
      const [resultsTwo] = await transaction.read('Albums', queryTwo);
      const rowsTwo = resultsTwo.map(row => row.toJSON());
      firstBudget = rowsTwo[0].MarketingBudget;
      console.log(`The first album's marketing budget: ${firstBudget}`);

      console.log(firstBudget, secondBudget);
      // Transfers the budgets between the albums
      firstBudget += transferAmount;
      secondBudget -= transferAmount;
      console.log(firstBudget, secondBudget);

      // Updates the database
      // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
      // must be converted (back) to strings before being inserted as INT64s.
      transaction.update('Albums', [
        {
          SingerId: '1',
          AlbumId: '1',
          MarketingBudget: firstBudget.toString(),
        },
        {
          SingerId: '2',
          AlbumId: '2',
          MarketingBudget: secondBudget.toString(),
        },
      ]);

      // Commits the transaction and send the changes to the database
      await transaction.commit();

      console.log(
        `Successfully executed read-write transaction to transfer ${transferAmount} from Album 2 to Album 1.`
      );
    });
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    // Closes the database when finished
    if (database) {
      await database.close();
    }
  }
  // [END spanner_read_write_transaction]
}

require('yargs')
  .demandCommand(1)
  .command(
    'readOnly <instanceName> <databaseName> <projectId>',
    'Execute a read-only transaction on an example Cloud Spanner table.',
    {},
    opts =>
      readOnlyTransaction(opts.instanceName, opts.databaseName, opts.projectId)
  )
  .command(
    'readWrite <instanceName> <databaseName> <projectId>',
    'Execute a read-write transaction on an example Cloud Spanner table.',
    {},
    opts =>
      readWriteTransaction(opts.instanceName, opts.databaseName, opts.projectId)
  )
  .example('node $0 readOnly "my-instance" "my-database" "my-project-id"')
  .example('node $0 readWrite "my-instance" "my-database" "my-project-id"')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/spanner/docs')
  .strict()
  .help().argv;
