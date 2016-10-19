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

const bigquery = require(`@google-cloud/bigquery`)();
const storage = require(`@google-cloud/storage`)();
const uuid = require(`node-uuid`);
const path = require(`path`);
const utils = require(`../../utils`);
const run = utils.run;
const noop = utils.noop;

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
  { Name: 'foo', Age: 27, Weight: 80.3, IsMagic: true },
  { Name: 'bar', Age: 13, Weight: 54.6, IsMagic: false }
];

describe('bigquery:tables', () => {
  before(() => {
    return storage.createBucket(bucketName)
      .then((results) => results[0].upload(localFilePath))
      .then(() => bigquery.createDataset(srcDatasetId))
      .then(() => bigquery.createDataset(destDatasetId));
  });

  after(() => {
    return bigquery.dataset(srcDatasetId).delete({ force: true })
      .then(() => bigquery.dataset(destDatasetId).delete({ force: true }), noop)
      .then(() => storage.bucket(bucketName).deleteFiles({ force: true }), noop)
      .then(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            storage.bucket(bucketName).delete().then(resolve, reject);
          }, 2000);
        });
      }, noop);
  });

  it(`should create a table`, () => {
    const output = run(`${cmd} create ${datasetId} ${tableId} "${schema}"`, cwd);
    assert.equal(output, `Table ${tableId} created.`);
    return bigquery.dataset(datasetId).table(tableId).exists()
      .then((results) => assert.equal(results[0], true));
  });

  it(`should list tables`, (done) => {
    // Listing is eventually consistent. Give the indexes time to update.
    setTimeout(() => {
      const output = run(`${cmd} list ${datasetId}`, cwd);
      assert.equal(output.includes(`Tables:`), true);
      assert.equal(output.includes(tableId), true);
      done();
    }, 5000);
  });

  it(`should import a local file`, () => {
    const output = run(`${cmd} import ${datasetId} ${tableId} ${localFilePath}`, cwd);
    assert.equal(output.includes(`started.`), true);
    assert.equal(output.includes(`completed.`), true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return bigquery.dataset(datasetId).table(tableId).getRows()
          .then((results) => {
            assert.equal(results[0].length, 1);
            resolve();
          })
          .catch(reject);
      }, 2000);
    });
  }).timeout(120000);

  it(`should browse table rows`, () => {
    const output = run(`${cmd} browse ${datasetId} ${tableId}`, cwd);
    assert.equal(output, `Rows:\n{ Name: 'Gandalf', Age: 2000, Weight: 140, IsMagic: true }`);
  });

  it(`should export a table to GCS`, () => {
    const output = run(`${cmd} export ${datasetId} ${tableId} ${bucketName} ${exportFileName}`, cwd);
    assert.equal(output.includes(`started.`), true);
    assert.equal(output.includes(`completed.`), true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        storage.bucket(bucketName).file(exportFileName).exists()
          .then((results) => {
            assert.equal(results[0], true);
            resolve();
          })
          .catch(reject);
      }, 10000);
    });
  }).timeout(120000);

  it(`should import a GCS file`, () => {
    const output = run(`${cmd} import-gcs ${datasetId} ${tableId} ${bucketName} ${importFileName}`, cwd);
    assert.equal(output.includes(`started.`), true);
    assert.equal(output.includes(`completed.`), true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return bigquery.dataset(datasetId).table(tableId).getRows()
          .then((results) => {
            assert.equal(results[0].length, 2);
            resolve();
          })
          .catch(reject);
      }, 2000);
    });
  }).timeout(120000);

  it(`should copy a table`, () => {
    const output = run(`${cmd} copy ${srcDatasetId} ${srcTableId} ${destDatasetId} ${destTableId}`, cwd);
    assert.equal(output.includes(`started.`), true);
    assert.equal(output.includes(`completed.`), true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        bigquery.dataset(destDatasetId).table(destTableId).getRows()
          .then((results) => {
            assert.equal(results[0].length, 2);
            resolve();
          })
          .catch(reject);
      }, 2000);
    });
  }).timeout(120000);

  it(`should insert rows`, () => {
    assert.throws(() => {
      run(`${cmd} insert ${datasetId} ${tableId} 'foo.bar'`, cwd);
    }, Error, `"json_or_file" (or the file it points to) is not a valid JSON array.`);
    const output = run(`${cmd} insert ${datasetId} ${tableId} '${JSON.stringify(rows)}'`, cwd);
    assert.equal(output, `Inserted:\n{ Name: 'foo', Age: 27, Weight: 80.3, IsMagic: true }\n{ Name: 'bar', Age: 13, Weight: 54.6, IsMagic: false }`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        bigquery.dataset(datasetId).table(tableId).getRows()
          .then((results) => {
            assert.equal(results[0].length, 4);
            resolve();
          })
          .catch(reject);
      }, 2000);
    });
  }).timeout(120000);

  it(`should delete a table`, () => {
    const output = run(`${cmd} delete ${datasetId} ${tableId}`, cwd);
    assert.equal(output, `Table ${tableId} deleted.`);
    return bigquery.dataset(datasetId).table(tableId).exists()
      .then((results) => assert.equal(results[0], false));
  });
});
