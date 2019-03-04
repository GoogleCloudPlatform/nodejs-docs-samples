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
const cmd = 'node dicom_stores.js';
const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const dicomStoreId = `nodejs-docs-samples-test-dicom-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const pubsubTopic = `nodejs-docs-samples-test-pubsub${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

const bucketName = process.env.GCLOUD_STORAGE_BUCKET;

const dcmFileName = `IM-0002-0001-JPEG-BASELINE.dcm`;
const gcsUri = bucketName + '/' + dcmFileName;

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

it('should create a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} createDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Created DICOM store/).test(output), true);
});

it('should get a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} getDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Got DICOM store/).test(output), true);
});

it('should patch a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} patchDicomStore ${datasetId} ${dicomStoreId} ${pubsubTopic}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Patched DICOM store with Cloud Pub\/Sub topic/).test(output),
    true
  );
});

it('should list DICOM stores', async () => {
  const output = await tools.runAsync(
    `${cmd} listDicomStores ${datasetId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/DICOM stores/).test(output), true);
});

it('should export a DICOM instance', async () => {
  const output = await tools.runAsync(
    `${cmd} exportDicomInstanceGcs ${datasetId} ${dicomStoreId} ${bucketName}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Exported DICOM instances to bucket/).test(output),
    true
  );
});

it('should import a DICOM object from GCS', async () => {
  const output = await tools.runAsync(
    `${cmd} importDicomObject ${datasetId} ${dicomStoreId} ${gcsUri}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Imported DICOM objects from bucket/).test(output),
    true
  );
});

it('should delete a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} deleteDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Deleted DICOM store/).test(output), true);
});
