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

const cmdDataset = 'node datasets.js';
const cmd = 'node fhir_stores.js';
const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const fhirStoreId = `nodejs-docs-samples-test-fhir-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const pubsubTopic = `nodejs-docs-samples-test-pubsub${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

before(async () => {
  tools.checkCredentials();
  await tools.runAsync(`${cmdDataset} createDataset ${datasetId}`, cwdDatasets);
});
after(async () => {
  try {
    await tools.runAsync(
      `${cmdDataset} deleteDataset ${datasetId}`,
      cwdDatasets
    );
  } catch (err) {} // Ignore error
});

it('should create a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} createFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Created FHIR store/).test(output), true);
});

it('should get a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} getFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Got FHIR store/).test(output), true);
});

it('should list FHIR stores', async () => {
  const output = await tools.runAsync(
    `${cmd} listFhirStores ${datasetId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/FHIR stores/).test(output), true);
});

it('should patch a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} patchFhirStore ${datasetId} ${fhirStoreId} ${pubsubTopic}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Patched FHIR store/).test(output), true);
});

it('should get FHIR store metadata', async () => {
  const output = await tools.runAsync(
    `${cmd} getMetadata ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Capabilities statement for FHIR store/).test(output),
    true
  );
});

it('should delete a FHIR store', async () => {
  const output = await tools.runAsync(
    `${cmd} deleteFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Deleted FHIR store/).test(output), true);
});
