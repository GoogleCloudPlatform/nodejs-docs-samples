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

require(`../../system-test/_setup`);

const proxyquire = require(`proxyquire`).noPreserveCache();
const bigquery = proxyquire(`@google-cloud/bigquery`, {})();
const uuid = require(`uuid`);

const expectedDatasetId = `my_new_dataset`;
let datasetId = `nodejs-docs-samples-test-${uuid.v4()}`;
datasetId = datasetId.replace(/-/gi, `_`);

test.after.always(async () => {
  try {
    bigquery.dataset(datasetId).delete({ force: true });
  } catch (err) {} // ignore error
});

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test(`quickstart should create a dataset`, async (t) => {
  await new Promise((resolve, reject) => {
    const bigqueryMock = {
      createDataset: (_datasetId) => {
        t.is(_datasetId, expectedDatasetId);

        return bigquery.createDataset(datasetId)
          .then(([dataset]) => {
            t.not(dataset, undefined);

            setTimeout(() => {
              try {
                t.true(console.log.calledOnce);
                t.deepEqual(console.log.firstCall.args, [`Dataset ${dataset.id} created.`]);
                resolve();
              } catch (err) {
                reject(err);
              }
            }, 200);

            return [dataset];
          }).catch(reject);
      }
    };

    proxyquire(`../quickstart`, {
      '@google-cloud/bigquery': sinon.stub().returns(bigqueryMock)
    });
  });
});
