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
const region = 'us-central1';

const cmdDataset = 'node datasets.js';
const cmd = 'node hl7v2_stores.js';
const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const hl7v2StoreId = `nodejs-docs-samples-test-hl7v2-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const pubsubTopic = process.env.PUBSUB_TOPIC;

before(async () => {
  tools.checkCredentials();
  await tools.runAsync(
    `node createDataset.js ${projectId} ${region} ${datasetId}`,
    cwdDatasets
  );
});
after(async () => {
  try {
    await tools.runAsync(
      `${cmdDataset} deleteDataset ${datasetId}`,
      cwdDatasets
    );
  } catch (err) {} // Ignore error
});

it('should create an HL7v2 store', async () => {
  const output = await tools.runAsync(
    `${cmd} createHl7v2Store ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  assert.ok(output.includes('Created HL7v2 store'));
});

it('should get an HL7v2 store', async () => {
  const output = await tools.runAsync(
    `${cmd} getHl7v2Store ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  assert.ok(output.includes('Got HL7v2 store'));
});

it('should patch an HL7v2 store', async () => {
  const output = await tools.runAsync(
    `${cmd} patchHl7v2Store ${datasetId} ${hl7v2StoreId} ${pubsubTopic}`,
    cwd
  );
  assert.ok(output.includes('Patched HL7v2 store with Cloud Pub/Sub topic'));
});

it('should list HL7v2 stores', async () => {
  const output = await tools.runAsync(
    `${cmd} listHl7v2Stores ${datasetId}`,
    cwd
  );
  assert.ok(output.includes('HL7v2 stores'));
});

it('should delete an HL7v2 Store', async () => {
  const output = await tools.runAsync(
    `${cmd} deleteHl7v2Store ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  assert.ok(output.includes('Deleted HL7v2 store'));
});
