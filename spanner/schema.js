/**
 * Copyright 2017, Google, Inc.
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

function createDatabase (instanceId, databaseId) {
  // [START create_database]
  // Imports the Google Cloud client library
  const Spanner = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = Spanner();

  // Uncomment these lines to specify the instance and database to use
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Gets a reference to a Cloud Spanner instance
  const instance = spanner.instance(instanceId);

  // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
  // must be converted to strings before being inserted as INT64s
  const request = {
    schema: [
      `CREATE TABLE Singers (
        SingerId    INT64 NOT NULL,
        FirstName   STRING(1024),
        LastName    STRING(1024),
        SingerInfo  BYTES(MAX)
      ) PRIMARY KEY (SingerId)`,
      `CREATE TABLE Albums (
        SingerId    INT64 NOT NULL,
        AlbumId     INT64 NOT NULL,
        AlbumTitle  STRING(MAX)
      ) PRIMARY KEY (SingerId, AlbumId),
      INTERLEAVE IN PARENT Singers ON DELETE CASCADE`
    ]
  };

  // Creates a database
  instance.createDatabase(databaseId, request)
    .then((results) => {
      const database = results[0];
      const operation = results[1];

      console.log(`Waiting for operation on ${database.id} to complete...`);
      return operation.promise();
    })
    .then(() => {
      console.log(`Created database ${databaseId} on instance ${instanceId}.`);
    });
  // [END create_database]
}

function addColumn (instanceId, databaseId) {
  // [START add_column]
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

  const request = [
    'ALTER TABLE Albums ADD COLUMN MarketingBudget INT64'
  ];

  // Creates a new index in the database
  database.updateSchema(request)
    .then((results) => {
      const operation = results[0];

      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then(() => {
      console.log('Added the MarketingBudget column.');
    });
  // [END add_column]
}

function queryDataWithNewColumn (instanceId, databaseId) {
  // [START query_data_with_new_column]
  // This sample uses the `MarketingBudget` column. You can add the column
  // by running the `add_column` sample or by running this DDL statement against
  // your database:
  //    ALTER TABLE Albums ADD COLUMN MarketingBudget INT64

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

  const query = {
    sql: `SELECT SingerId, AlbumId, MarketingBudget FROM Albums`
  };

  // Queries rows from the Albums table
  database.run(query)
    .then((results) => {
      const rows = results[0];

      rows.forEach((row) => {
        const json = row.toJSON();

        console.log(`SingerId: ${json.SingerId.value}, AlbumId: ${json.AlbumId.value}, MarketingBudget: ${json.MarketingBudget ? json.MarketingBudget.value : null}`);
      });
    });
  // [END query_data_with_new_column]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `createDatabase <instanceName> <databaseName>`,
    `Creates an example database with two tables in a Cloud Spanner instance.`,
    {},
    (opts) => createDatabase(opts.instanceName, opts.databaseName)
  )
  .command(
    `addColumn <instanceName> <databaseName>`,
    `Adds an example MarketingBudget column to an example Cloud Spanner table.`,
    {},
    (opts) => addColumn(opts.instanceName, opts.databaseName)
  )
  .command(
    `queryNewColumn <instanceName> <databaseName>`,
    `Executes a read-only SQL query against an example Cloud Spanner table with an additional column (MarketingBudget) added by addColumn.`,
    {},
    (opts) => queryDataWithNewColumn(opts.instanceName, opts.databaseName)
  )
  .example(`node $0 createDatabase "my-instance" "my-database"`)
  .example(`node $0 addColumn "my-instance" "my-database"`)
  .example(`node $0 queryNewColumn "my-instance" "my-database"`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/spanner/docs`);

if (module === require.main) {
  cli.help().strict().argv;
}
