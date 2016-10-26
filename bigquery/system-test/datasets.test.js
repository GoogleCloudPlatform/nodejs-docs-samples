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
const uuid = require(`node-uuid`);
const path = require(`path`);
const run = require(`../../utils`).run;

const cwd = path.join(__dirname, `..`);
const cmd = `node datasets.js`;
const datasetId = (`nodejs-docs-samples-test-${uuid.v4()}`).replace(/-/gi, '_');

describe(`bigquery:datasets`, function () {
  after(() => {
    return bigquery
      .dataset(datasetId)
      .delete({ force: true })
      .catch(() => undefined);
  });

  it(`should create a dataset`, () => {
    const output = run(`${cmd} create ${datasetId}`, cwd);
    assert.equal(output, `Dataset ${datasetId} created.`);
    return bigquery.dataset(datasetId).exists()
      .then((results) => assert.equal(results[0], true));
  });

  it(`should list datasets`, (done) => {
    // Listing is eventually consistent. Give the indexes time to update.
    setTimeout(() => {
      const output = run(`${cmd} list`, cwd);
      assert.equal(output.includes(`Datasets:`), true);
      assert.equal(output.includes(datasetId), true);
      done();
    }, 5000);
  });

  it(`should return the size of a dataset`, function () {
    let output = run(`${cmd} size hacker_news bigquery-public-data`, cwd);
    assert.equal(output.includes(`Size of hacker_news`), true);
    assert.equal(output.includes(`MB`), true);
    output = run(`${cmd} size ${datasetId}`, cwd);
    assert.equal(output.includes(`Size of ${datasetId}: 0 MB`), true);
  });

  it(`should delete a dataset`, () => {
    const output = run(`${cmd} delete ${datasetId}`, cwd);
    assert.equal(output, `Dataset ${datasetId} deleted.`);
    return bigquery.dataset(datasetId).exists()
      .then((results) => assert.equal(results[0], false));
  });
});
