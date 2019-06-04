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

const cmd = 'node fhir_stores.js';
const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const fhirStoreId = `nodejs-docs-samples-test-fhir-store${uuid.v4()}`.replace(
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
    await tools.runAsync(`node deleteDataset.js ${datasetId}`, cwdDatasets);
  } catch (err) {} // Ignore error
});

it('should create a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} createFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.ok(output.includes('Created FHIR store'));
});

it('should get a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} getFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.ok(output.includes('Got FHIR store'));
});

it('should list FHIR stores', async () => {
  const output = await tools.runAsync(
    `${cmd} listFhirStores ${datasetId}`,
    cwd
  );
  assert.ok(output.includes('FHIR stores'));
});

it('should patch a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} patchFhirStore ${datasetId} ${fhirStoreId} ${pubsubTopic}`,
    cwd
  );
  assert.ok(output.includes('Patched FHIR store'));
});

it('should get FHIR store metadata', async () => {
  const output = await tools.runAsync(
    `${cmd} getMetadata ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.ok(output.includes('Capabilities statement for FHIR store'));
});

it('should delete a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} deleteFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.ok(output.includes('Deleted FHIR store'));
});
