/**
 * Copyright 2018, Google, LLC
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

const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');

const projectId = process.env.GCLOUD_PROJECT;
const cloudRegion = 'us-central1';

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const hl7v2StoreId = `nodejs-docs-samples-test-hl7v2-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

const messageFile = 'resources/hl7v2-sample.json';
const messageId = '2yqbdhYHlk_ucSmWkcKOVm_N0p0OpBXgIlVG18rB-cw=';
const labelKey = 'my-key';
const labelValue = 'my-value';

before(async () => {
  tools.checkCredentials();
  await tools.runAsync(
    `node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwdDatasets
  );
});
after(async () => {
  try {
    await tools.runAsync(
      `node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
      cwdDatasets
    );
  } catch (err) {} // Ignore error
});

it('should create an HL7v2 message', async () => {
  await tools.runAsync(
    `node createHl7v2Store.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  const output = await tools.runAsync(
    `node createHl7v2Message.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId} ${messageFile}`,
    cwd
  );
  assert.ok(output.includes('Created HL7v2 message'));
});

it('should ingest an HL7v2 message', async () => {
  const output = await tools.runAsync(
    `node ingestHl7v2Message.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId} ${messageFile}`,
    cwd
  );
  assert.ok(output.includes('Ingested HL7v2 message'));
});

it('should get an HL7v2 message', async () => {
  const output = await tools.runAsync(
    `node getHl7v2Message.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId} ${messageId}`,
    cwd
  );
  assert.ok(output.includes('Got HL7v2 message'));
});

it('should list HL7v2 messages', async () => {
  const output = await tools.runAsync(
    `node listHl7v2Messages.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  assert.ok(output.includes('HL7v2 messages'));
});

it('should patch an HL7v2 message', async () => {
  const output = await tools.runAsync(
    `node patchHl7v2Message.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId} ${messageId} ${labelKey} ${labelValue}`,
    cwd
  );
  assert.ok(output.includes('Patched HL7v2 message'));
});

it('should delete an HL7v2 message', async () => {
  const output = await tools.runAsync(
    `node deleteHl7v2Message.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId} ${messageId}`,
    cwd
  );
  assert.ok(output.includes('Deleted HL7v2 message'));

  // Clean up
  tools.runAsync(
    `node deleteHl7v2Store.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
});
