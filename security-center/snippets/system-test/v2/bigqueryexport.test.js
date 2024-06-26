/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {SecurityCenterClient} = require('@google-cloud/security-center').v2;
const {assert} = require('chai');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});
const {describe, it, before} = require('mocha');
const uuidv1 = require('uuid').v1;

const organizationId = process.env['GCLOUD_ORGANIZATION'];
const projectId = process.env['GOOGLE_CLOUD_PROJECT'];
const dataset = `projects/${projectId}/datasets/testDataset`;
const location = 'global';

describe('Client with bigquery export V2', async () => {
  let data;
  before(async () => {
    // Creates a new client.
    const client = new SecurityCenterClient();

    // Build the create bigquery export request.
    const bigQueryExportId =
      'bigqueryexportid-' + uuidv1().replace(/-/g, '').substring(0, 20);
    const filter = 'severity="LOW" OR severity="MEDIUM"';
    const bigQueryExport = {
      name: 'bigQueryExport node',
      description:
        'Export low and medium findings if the compute resource has an IAM anomalous grant',
      filter: filter,
      dataset: dataset,
    };
    const createBigQueryExportRequest = {
      parent: client.organizationLocationPath(organizationId, location),
      bigQueryExport,
      bigQueryExportId,
    };

    const [bigQueryExportResponse] = await client
      .createBigQueryExport(createBigQueryExportRequest)
      .catch(error => console.error(error));

    data = {
      orgId: organizationId,
      bigQueryExportId: bigQueryExportId,
      bigQueryExportName: bigQueryExportResponse.name,
      untouchedbigQueryExportName: '',
    };
    console.log('my data bigQueryExport %j', data);
  });

  it('client can create bigquery export V2', () => {
    const output = exec(
      `node v2/createBigQueryExport.js ${data.orgId} ${dataset}`
    );
    assert(output.includes(data.orgId));
    assert.match(output, /BigQuery export request created successfully/);
    assert.notMatch(output, /undefined/);
  });

  it('client can list all bigquery export V2', () => {
    const output = exec(`node v2/listAllBigQueryExports.js ${data.orgId}`);
    assert(output.includes(data.bigQueryExportName));
    assert.match(output, /Sources/);
    assert.notMatch(output, /undefined/);
  });

  it('client can get a bigquery export V2', () => {
    const output = exec(
      `node v2/getBigQueryExport.js ${data.orgId} ${data.bigQueryExportId}`
    );
    assert(output.includes(data.bigQueryExportName));
    assert.match(output, /Retrieved the BigQuery export/);
    assert.notMatch(output, /undefined/);
  });

  it('client can update a bigquery export V2', () => {
    const output = exec(
      `node v2/updateBigQueryExport.js ${data.orgId} ${data.bigQueryExportId} ${dataset}`
    );
    assert.match(output, /BigQueryExport updated successfully/);
    assert.notMatch(output, /undefined/);
  });

  it('client can delete a bigquery export V2', () => {
    const output = exec(
      `node v2/deleteBigQueryExport.js ${data.orgId} ${data.bigQueryExportId}`
    );
    assert.match(output, /BigQuery export request deleted successfully/);
    assert.notMatch(output, /undefined/);
  });
});
