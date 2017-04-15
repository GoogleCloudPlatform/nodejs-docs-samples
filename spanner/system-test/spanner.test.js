/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require(`path`);
const spanner = require(`@google-cloud/spanner`)();
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const crudCmd = `node crud.js`;
const schemaCmd = `node schema.js`;
const indexingCmd = `node indexing.js`;
const transactionCmd = `node transaction.js`;

const cwd = path.join(__dirname, `..`);

const INSTANCE_ID = `test-instance`;
const DATABASE_ID = `test-database-${Date.now()}`;

test.before(tools.checkCredentials);
test.before(async (t) => {
  const instance = spanner.instance(INSTANCE_ID);
  const database = instance.database(DATABASE_ID);
  try {
    await database.delete();
  } catch (err) {
    // Ignore error
  }
});

test.after.always(async (t) => {
  const instance = spanner.instance(INSTANCE_ID);
  const database = instance.database(DATABASE_ID);
  try {
    await database.delete();
  } catch (err) {
    // Ignore error
  }
});

// create_database
test.serial(`should create an example database`, async (t) => {
  const output = await tools.runAsync(`${schemaCmd} createDatabase "${INSTANCE_ID}" "${DATABASE_ID}"`, cwd);
  t.true(output.includes(`Waiting for operation on ${DATABASE_ID} to complete...`));
  t.true(output.includes(`Created database ${DATABASE_ID} on instance ${INSTANCE_ID}.`));
});

// insert_data
test.serial(`should insert rows into an example table`, async (t) => {
  let output = await tools.runAsync(`${crudCmd} insert ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`Inserted data.`));
});

// query_data
test.serial(`should query an example table and return matching rows`, async (t) => {
  const output = await tools.runAsync(`${crudCmd} query ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`SingerId: 1, AlbumId: 1, AlbumTitle: Go, Go, Go`));
});

// read_data
test.serial(`should read an example table`, async (t) => {
  const output = await tools.runAsync(`${crudCmd} read ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`SingerId: 1, AlbumId: 1, AlbumTitle: Go, Go, Go`));
});

// add_column
test.serial(`should add a column to a table`, async (t) => {
  const output = await tools.runAsync(`${schemaCmd} addColumn ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`Waiting for operation to complete...`));
  t.true(output.includes(`Added the MarketingBudget column.`));
});

// update_data
test.serial(`should update existing rows in an example table`, async (t) => {
  let output = await tools.runAsync(`${crudCmd} update ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`Updated data.`));
});

// query_data_with_new_column
test.serial(`should query an example table with an additional column and return matching rows`, async (t) => {
  const output = await tools.runAsync(`${schemaCmd} queryNewColumn ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`SingerId: 1, AlbumId: 1, MarketingBudget: 100000`));
  t.true(output.includes(`SingerId: 2, AlbumId: 2, MarketingBudget: 500000`));
});

// create_index
test.serial(`should create an index in an example table`, async (t) => {
  let output = await tools.runAsync(`${indexingCmd} createIndex ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`Waiting for operation to complete...`));
  t.true(output.includes(`Added the AlbumsByAlbumTitle index.`));
});

// create_storing_index
test.serial(`should create a storing index in an example table`, async (t) => {
  const output = await tools.runAsync(`${indexingCmd} createStoringIndex ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`Waiting for operation to complete...`));
  t.true(output.includes(`Added the AlbumsByAlbumTitle2 index.`));
});

// query_data_with_index
test.serial(`should query an example table with an index and return matching rows`, async (t) => {
  const output = await tools.runAsync(`${indexingCmd} queryIndex ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`AlbumId: 1, AlbumTitle: Go, Go, Go, MarketingBudget:`));
});

// read_data_with_index
test.serial(`should read an example table with an index`, async (t) => {
  const output = await tools.runAsync(`${indexingCmd} readIndex ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`AlbumId: 1, AlbumTitle: Go, Go, Go`));
});

// read_data_with_storing_index
test.serial(`should read an example table with a storing index`, async (t) => {
  const output = await tools.runAsync(`${indexingCmd} readStoringIndex ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`AlbumId: 1, AlbumTitle: Go, Go, Go`));
});

// read_only_transaction
test.serial(`should read an example table using transactions`, async (t) => {
  const output = await tools.runAsync(`${transactionCmd} readOnly ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`SingerId: 1, AlbumId: 1, AlbumTitle: Go, Go, Go`));
  t.true(output.includes(`Successfully executed read-only transaction.`));
});

// read_write_transaction
test.serial(`should read from and write to an example table using transactions`, async (t) => {
  let output = await tools.runAsync(`${transactionCmd} readWrite ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`The first album's marketing budget: 100000`));
  t.true(output.includes(`The second album's marketing budget: 500000`));
  t.true(output.includes(`Successfully executed read-write transaction to transfer 200000 from Album 2 to Album 1.`));

  output = await tools.runAsync(`${schemaCmd} queryNewColumn ${INSTANCE_ID} ${DATABASE_ID}`, cwd);
  t.true(output.includes(`SingerId: 1, AlbumId: 1, MarketingBudget: 300000`));
  t.true(output.includes(`SingerId: 2, AlbumId: 2, MarketingBudget: 300000`));
});
