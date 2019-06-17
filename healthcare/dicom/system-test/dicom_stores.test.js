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
const bucketName = process.env.BUCKET_NAME;
const region = 'us-central1';

const cmd = 'node dicom_stores.js';
const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const dicomStoreId = `nodejs-docs-samples-test-dicom-store-${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const pubsubTopic = `nodejs-docs-samples-test-pubsub-${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

const dcmFileName = `IM-0002-0001-JPEG-BASELINE.dcm`;
const gcsUri = `${bucketName}/${dcmFileName}`;

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

it('should create a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} createDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  assert.ok(output.includes('Created DICOM store'));
});

it('should get a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} getDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  assert.ok(output.includes('Got DICOM store'));
});

it('should patch a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} patchDicomStore ${datasetId} ${dicomStoreId} ${pubsubTopic}`,
    cwd
  );
  assert.ok(output.includes('Patched DICOM store with Cloud Pub/Sub topic'));
});

it('should list DICOM stores', async () => {
  const output = await tools.runAsync(
    `${cmd} listDicomStores ${datasetId}`,
    cwd
  );
  assert.ok(output.includes('DICOM stores'));
});

it('should export a DICOM instance', async () => {
  const output = await tools.runAsync(
    `${cmd} exportDicomInstanceGcs ${datasetId} ${dicomStoreId} ${bucketName}`,
    cwd
  );
  assert.ok(output.includes('Exported DICOM instances to bucket'));
});

it('should import a DICOM object from GCS', async () => {
  const output = await tools.runAsync(
    `${cmd} importDicomObject ${datasetId} ${dicomStoreId} ${gcsUri}`,
    cwd
  );
  assert.ok(output.includes('Imported DICOM objects from bucket'));
});

it('should delete a DICOM store', async () => {
  const output = await tools.runAsync(
    `${cmd} deleteDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  assert.ok(output.includes('Deleted DICOM store'));
});
