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

function updateData (instanceId, databaseId) {
  // [START update_data]
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

  // Update a row in the Albums table
  // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
  // must be converted to strings before being inserted as INT64s
  const albumsTable = database.table('Albums');

  albumsTable.update([
    { SingerId: '1', AlbumId: '1', MarketingBudget: '100000' },
    { SingerId: '2', AlbumId: '2', MarketingBudget: '500000' }
  ])
  .then(() => {
    console.log('Updated data.');
  });
  // [END update_data]
}

function insertData (instanceId, databaseId) {
  // [START insert_data]
  // Imports the Google Cloud client library
  const Spanner = require('@google-cloud/spanner');

  // Instantiates a client
  const spanner = Spanner();

  // Uncomment these lines to specify the instance and database to use
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Gets a reference to a Spanner instance and database
  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);

  // Instantiate Spanner table objects
  const singersTable = database.table('Singers');
  const albumsTable = database.table('Albums');

  // Inserts rows into the Singers table
  // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so
  // they must be converted to strings before being inserted as INT64s
  singersTable.insert([
    { SingerId: '1', FirstName: 'Marc', LastName: 'Richards' },
    { SingerId: '2', FirstName: 'Catalina', LastName: 'Smith' },
    { SingerId: '3', FirstName: 'Alice', LastName: 'Trentor' },
    { SingerId: '4', FirstName: 'Lea', LastName: 'Martin' },
    { SingerId: '5', FirstName: 'David', LastName: 'Lomond' }
  ])
  .then(() => {
    // Inserts rows into the Albums table
    albumsTable.insert([
      { SingerId: '1', AlbumId: '1', AlbumTitle: 'Go, Go, Go' },
      { SingerId: '1', AlbumId: '2', AlbumTitle: 'Total Junk' },
      { SingerId: '2', AlbumId: '1', AlbumTitle: 'Green' },
      { SingerId: '2', AlbumId: '2', AlbumTitle: 'Forever Hold your Peace' },
      { SingerId: '2', AlbumId: '3', AlbumTitle: 'Terrified' }
    ]);
  })
  .then(() => {
    console.log('Inserted data.');
  });
  // [END insert_data]
}

function queryData (instanceId, databaseId) {
  // [START query_data]
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
    sql: 'SELECT SingerId, AlbumId, AlbumTitle FROM Albums'
  };

  // Queries rows from the Albums table
  database.run(query)
    .then((results) => {
      const rows = results[0];

      rows.forEach((row) => {
        const json = row.toJSON();
        console.log(`SingerId: ${json.SingerId.value}, AlbumId: ${json.AlbumId.value}, AlbumTitle: ${json.AlbumTitle}`);
      });
    });
  // [END query_data]
}

function readData (instanceId, databaseId) {
  // [START read_data]
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

  // Reads rows from the Albums table
  const albumsTable = database.table('Albums');

  const query = {
    columns: ['SingerId', 'AlbumId', 'AlbumTitle'],
    keySet: {
      all: true
    }
  };

  albumsTable.read(query)
    .then((results) => {
      const rows = results[0];

      rows.forEach((row) => {
        const json = row.toJSON();
        console.log(`SingerId: ${json.SingerId.value}, AlbumId: ${json.AlbumId.value}, AlbumTitle: ${json.AlbumTitle}`);
      });
    });
  // [END read_data]
}

function readStaleData (instanceId, databaseId) {
  // [START read_stale_data]
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

  // Reads rows from the Albums table
  const albumsTable = database.table('Albums');

  const query = {
    columns: ['SingerId', 'AlbumId', 'AlbumTitle', 'MarketingBudget'],
    keySet: {
      all: true
    }
  };

  const options = {
    // Guarantees that all writes committed more than 10 seconds ago are visible
    exactStaleness: 10
  };

  albumsTable.read(query, options)
    .then((results) => {
      const rows = results[0];

      rows.forEach((row) => {
        const json = row.toJSON();
        const id = json.SingerId.value;
        const album = json.AlbumId.value;
        const title = json.AlbumTitle;
        const budget = json.MarketingBudget ? json.MarketingBudget.value : '';
        console.log(`SingerId: ${id}, AlbumId: ${album}, AlbumTitle: ${title}, MarketingBudget: ${budget}`);
      });
    });
  // [END read_stale_data]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `update <instanceName> <databaseName>`,
    `Modifies existing rows of data in an example Cloud Spanner table.`,
    {},
    (opts) => updateData(opts.instanceName, opts.databaseName)
  )
  .command(
    `query <instanceName> <databaseName>`,
    `Executes a read-only SQL query against an example Cloud Spanner table.`,
    {},
    (opts) => queryData(opts.instanceName, opts.databaseName)
  )
  .command(
    `insert <instanceName> <databaseName>`,
    `Inserts new rows of data into an example Cloud Spanner table.`,
    {},
    (opts) => insertData(opts.instanceName, opts.databaseName)
  )
  .command(
    `read <instanceName> <databaseName>`,
    `Reads data in an example Cloud Spanner table.`,
    {},
    (opts) => readData(opts.instanceName, opts.databaseName)
  )
  .command(
    `read-stale <instanceName> <databaseName>`,
    `Reads stale data in an example Cloud Spanner table.`,
    {},
    (opts) => readStaleData(opts.instanceName, opts.databaseName)
  )
  .example(`node $0 update "my-instance" "my-database"`)
  .example(`node $0 query "my-instance" "my-database"`)
  .example(`node $0 insert "my-instance" "my-database"`)
  .example(`node $0 read "my-instance" "my-database"`)
  .example(`node $0 read-stale "my-instance" "my-database"`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/spanner/docs`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
