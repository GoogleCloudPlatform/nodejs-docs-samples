/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function readOnlyTransaction (instanceId, databaseId) {
  // [START read_only_transaction]
  // Imports the Google Cloud client library
  const Spanner = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = Spanner();

  // Uncomment these lines to specify the instance and database to use
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Gets a reference to a Cloud Spanner instance and database
  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);

  // Gets a transaction object that captures the database state
  // at a specific point in time
  database.runTransaction()
    .then((results) => {
      const transaction = results[0];

      const queryOne = 'SELECT SingerId, AlbumId, AlbumTitle FROM Albums';

      // Read #1, using SQL
      transaction.run(queryOne)
        .then((results) => {
          const rows = results[0];

          rows.forEach((row) => {
            const json = row.toJSON();
            console.log(`SingerId: ${json.SingerId.value}, AlbumId: ${json.AlbumId.value}, AlbumTitle: ${json.AlbumTitle}`);
          });
        });

      const queryTwo = {
        columns: ['SingerId', 'AlbumId', 'AlbumTitle'],
        keySet: {
          all: true
        }
      };

      // Read #2, using the `read` method. Even if changes occur
      // in-between the reads, the transaction ensures that both
      // return the same data.
      transaction.read('Albums', queryTwo)
        .then((results) => {
          const rows = results[0];

          rows.forEach((row) => {
            const json = row.toJSON();
            console.log(`SingerId: ${json.SingerId.value}, AlbumId: ${json.AlbumId.value}, AlbumTitle: ${json.AlbumTitle}`);
          });
        });
    })
    .then(() => {
      console.log('Successfully executed read-only transaction.');
    });
  // [END read_only_transaction]
}

function readWriteTransaction (instanceId, databaseId) {
  // [START read_write_transaction]
  // This sample transfers 200,000 from the MarketingBudget field
  // of the second Album to the first Album. Make sure to run the
  // addColumn and updateData samples first (in that order).

  // Imports the Google Cloud client library
  const Spanner = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = Spanner();

  // Uncomment these lines to specify the instance and database to use
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Gets a reference to a Cloud Spanner instance and database
  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);

  // Gets a transaction object that captures the database state
  // at a specific point in time
  let transaction, firstBudget, secondBudget;
  const transferAmount = 200000;
  const minimumAmountToTransfer = 300000;

  database.runTransaction()
    .then((results) => {
      transaction = results[0];

      const queryOne = {
        columns: [`MarketingBudget`],
        keys: [2, 2] // SingerId: 2, AlbumId: 2
      };

      const queryTwo = {
        columns: ['MarketingBudget'],
        keys: [1, 1] // SingerId: 1, AlbumId: 1
      };

      return Promise.all([
        // Reads the second album's budget
        transaction.read('Albums', queryOne).then((results) => {
          // Gets second album's budget
          // Note: MarketingBudget is an INT64, which comes from Cloud Spanner
          // as a string - so we convert it to a number with parseInt()
          const rows = results[0].map((row) => row.toJSON());
          secondBudget = parseInt(rows[0].MarketingBudget.value);
          console.log(`The second album's marketing budget: ${secondBudget}`);

          // Makes sure the second album's budget is sufficient
          if (secondBudget < minimumAmountToTransfer) {
            throw new Error(`The second album's budget (${secondBudget}) is less than the minimum required amount to transfer.`);
          }
        }),

        // Reads the first album's budget
        transaction.read('Albums', queryTwo).then((results) => {
          // Gets first album's budget
          // As above, MarketingBudget is an INT64 and comes as a string
          const rows = results[0].map((row) => row.toJSON());
          firstBudget = parseInt(rows[0].MarketingBudget.value);
          console.log(`The first album's marketing budget: ${firstBudget}`);
        })
      ]);
    })
    .then(() => {
      // Transfer the budgets between the albums
      console.log(firstBudget, secondBudget);
      firstBudget += transferAmount;
      secondBudget -= transferAmount;

      console.log(firstBudget, secondBudget);

      // Update the database
      // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
      // must be converted (back) to strings before being inserted as INT64s.
      transaction.update('Albums', [
        { SingerId: '1', AlbumId: '1', MarketingBudget: firstBudget.toString() },
        { SingerId: '2', AlbumId: '2', MarketingBudget: secondBudget.toString() }
      ]);
    })
    // Commits the transaction and send the changes to the database
    .then(() => transaction.commit())
    .then(() => {
      // Logs success
      console.log(`Successfully executed read-write transaction to transfer ${transferAmount} from Album 2 to Album 1.`);
    });
    // [END read_write_transaction]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `readOnly <instanceName> <databaseName>`,
    `Execute a read-only transaction on an example Cloud Spanner table.`,
    {},
    (opts) => readOnlyTransaction(opts.instanceName, opts.databaseName)
  )
  .command(
    `readWrite <instanceName> <databaseName>`,
    `Execute a read-write transaction on an example Cloud Spanner table.`,
    {},
    (opts) => readWriteTransaction(opts.instanceName, opts.databaseName)
  )
  .example(`node $0 readOnly "my-instance" "my-database"`)
  .example(`node $0 readWrite "my-instance" "my-database"`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/spanner/docs`);

if (module === require.main) {
  cli.help().strict().argv;
}
