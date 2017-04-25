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

const bigquery = require(`@google-cloud/bigquery`)();
const path = require(`path`);
const storage = require(`@google-cloud/storage`)();
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cwd = path.join(__dirname, `..`);
const cmd = `node tables.js`;
const generateUuid = () => `nodejs_docs_samples_${uuid.v4().replace(/-/gi, '_')}`;

const datasetId = generateUuid();
const srcDatasetId = datasetId;
const destDatasetId = generateUuid();
const tableId = generateUuid();
const srcTableId = tableId;
const destTableId = generateUuid();
const schema = `Name:string, Age:integer, Weight:float, IsMagic:boolean`;
const bucketName = generateUuid();
const exportFileName = `data.json`;
const importFileName = `data.csv`;
const localFilePath = path.join(__dirname, `../resources/${importFileName}`);
const rows = [
  { Name: `foo`, Age: 27, Weight: 80.3, IsMagic: true },
  { Name: `bar`, Age: 13, Weight: 54.6, IsMagic: false }
];

test.before(tools.checkCredentials);
test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await Promise.all([
    bucket.upload(localFilePath),
    bigquery.createDataset(srcDatasetId),
    bigquery.createDataset(destDatasetId)
  ]);
});
test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);
test.after.always(async () => {
  try {
    await bigquery.dataset(srcDatasetId).delete({ force: true });
  } catch (err) {} // ignore error
  try {
    await bigquery.dataset(destDatasetId).delete({ force: true });
  } catch (err) {} // ignore error
  try {
    await storage.bucket(bucketName).deleteFiles({ force: true });
  } catch (err) {} // ignore error
  try {
    // Try deleting files a second time
    await storage.bucket(bucketName).deleteFiles({ force: true });
  } catch (err) {} // ignore error
  try {
    await bigquery.dataset(srcDatasetId).delete({ force: true });
  } catch (err) {} // ignore error
  try {
    await storage.bucket(bucketName).delete();
  } catch (err) {} // ignore error
});

test.serial(`should create a table`, async (t) => {
  const output = await tools.runAsync(`${cmd} create ${datasetId} ${tableId} "${schema}"`, cwd);
  t.is(output, `Table ${tableId} created.`);
  const [exists] = await bigquery.dataset(datasetId).table(tableId).exists();
  t.true(exists);
});

test.serial(`should list tables`, async (t) => {
  t.plan(0);
  await tools.tryTest(async (assert) => {
    const output = await tools.runAsync(`${cmd} list ${datasetId}`, cwd);
    assert(output.includes(`Tables:`));
    assert(output.includes(tableId));
  }).start();
});

test.serial(`should import a local file`, async (t) => {
  t.plan(2);
  const output = await tools.runAsync(`${cmd} import ${datasetId} ${tableId} ${localFilePath}`, cwd);
  t.true(output.includes(`started.`));
  t.true(output.includes(`completed.`));
  await tools.tryTest(async (assert) => {
    const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
    assert.equal(rows.length, 1);
  }).start();
});

test.serial(`should browse table rows`, async (t) => {
  const output = await tools.runAsync(`${cmd} browse ${datasetId} ${tableId}`, cwd);
  t.is(output, `Rows:\n{ Name: 'Gandalf', Age: 2000, Weight: 140, IsMagic: true }`);
});

test.serial(`should export a table to GCS`, async (t) => {
  t.plan(2);
  const output = await tools.runAsync(`${cmd} export ${datasetId} ${tableId} ${bucketName} ${exportFileName}`, cwd);
  t.true(output.includes(`started.`));
  t.true(output.includes(`completed.`));
  await tools.tryTest(async (assert) => {
    const [exists] = await storage.bucket(bucketName).file(exportFileName).exists();
    assert(exists);
  }).start();
});

test.serial(`should import a GCS file`, async (t) => {
  t.plan(2);
  const output = await tools.runAsync(`${cmd} import-gcs ${datasetId} ${tableId} ${bucketName} ${importFileName}`, cwd);
  t.true(output.includes(`started.`));
  t.true(output.includes(`completed.`));
  await tools.tryTest(async (assert) => {
    const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
    assert.equal(rows.length, 2);
  }).start();
});

test.serial(`should copy a table`, async (t) => {
  t.plan(2);
  const output = await tools.runAsync(`${cmd} copy ${srcDatasetId} ${srcTableId} ${destDatasetId} ${destTableId}`, cwd);
  t.true(output.includes(`started.`));
  t.true(output.includes(`completed.`));
  await tools.tryTest(async (assert) => {
    const [rows] = await bigquery.dataset(destDatasetId).table(destTableId).getRows();
    assert.equal(rows.length, 2);
  }).start();
});

test.serial(`should insert rows`, async (t) => {
  t.plan(3);
  const err = await t.throws(tools.runAsync(`${cmd} insert ${datasetId} ${tableId} 'foo.bar'`, cwd));
  t.true(err.message.includes(`"json_or_file" (or the file it points to) is not a valid JSON array.`));
  const output = await tools.runAsync(`${cmd} insert ${datasetId} ${tableId} '${JSON.stringify(rows)}'`, cwd);
  t.is(output.includes(`Inserted:\n{ Name: 'foo', Age: 27, Weight: 80.3, IsMagic: true }\n{ Name: 'bar', Age: 13, Weight: 54.6, IsMagic: false }`), true);
  await tools.tryTest(async (assert) => {
    const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
    assert.equal(rows.length, 4);
  }).start();
});

test.serial(`should delete a table`, async (t) => {
  const output = await tools.runAsync(`${cmd} delete ${datasetId} ${tableId}`, cwd);
  t.is(output, `Table ${tableId} deleted.`);
  const [exists] = await bigquery.dataset(datasetId).table(tableId).exists();
  t.false(exists);
});
