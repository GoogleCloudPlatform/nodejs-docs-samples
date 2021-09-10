// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict';

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const uuid = require('uuid');
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests';
const generateUuid = () =>
  `${GCLOUD_TESTS_PREFIX}_${uuid.v4()}`.replace(/-/gi, '_');

const {
  ContactCenterInsightsClient,
} = require('@google-cloud/contact-center-insights');
const client = new ContactCenterInsightsClient();

const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const bigqueryDataset = generateUuid();
const bigqueryTable = generateUuid();

describe('ExportToBigQuery', () => {
  let projectId;
  let bigqueryProjectId;

  before(async () => {
    projectId = await client.getProjectId();
    bigqueryProjectId = await client.getProjectId();

    // Creates a BigQuery dataset and table.
    const bigqueryOptions = {
      location: 'US',
    };
    await bigquery.createDataset(bigqueryDataset, bigqueryOptions);
    await bigquery
      .dataset(bigqueryDataset)
      .createTable(bigqueryTable, bigqueryOptions);
  });

  after(async () => {
    // Deletes the BigQuery dataset and table.
    await bigquery
      .dataset(bigqueryDataset)
      .delete({force: true})
      .catch(console.warn);
  });

  it('should export data to BigQuery', async () => {
    const stdout = execSync(`node ./exportToBigquery.js \
                             ${projectId} ${bigqueryProjectId} ${bigqueryDataset} ${bigqueryTable}`);
    assert.match(stdout, new RegExp('Exported data to BigQuery'));
  });
});
