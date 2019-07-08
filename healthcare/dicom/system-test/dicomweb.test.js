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

const cmd = 'node dicomweb.js';

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-dicomweb-${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const dicomStoreId = `nodejs-docs-samples-test-dicomweb-dicom-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

const dcmFile = 'resources/IM-0002-0001-JPEG-BASELINE-edited.dcm';
const boundary = 'DICOMwebBoundary';
// The studyUid is not assigned by the server and is part of the metadata
// of dcmFile.
const studyUid = '1.2.840.113619.2.176.3596.3364818.7819.1259708454.105';

before(async () => {
  tools.checkCredentials();
  await tools.runAsync(
    `node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwdDatasets
  );
  await tools.runAsync(
    `node createDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
    cwd
  );
});
after(async () => {
  try {
    await tools.runAsync(
      `node deleteDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
      cwd
    );
    await tools.runAsync(`node deleteDataset.js ${datasetId}`, cwdDatasets);
  } catch (err) {} // Ignore error
});

it('should store a DICOM instance', async () => {
  const output = await tools.runAsync(
    `${cmd} dicomWebStoreInstance ${datasetId} ${dicomStoreId} ${dcmFile} ${boundary}`,
    cwd
  );
  assert.ok(output.includes('Stored instance'));
});

it('should search DICOM instances', async () => {
  const output = await tools.runAsync(
    `${cmd} dicomWebSearchInstances ${datasetId} ${dicomStoreId}`,
    cwd
  );
  assert.ok(output.includes('Instances'));
});

it('should retrieve a DICOM study', async () => {
  const output = await tools.runAsync(
    `${cmd} dicomWebRetrieveStudy ${datasetId} ${dicomStoreId} ${studyUid}`,
    cwd
  );
  assert.ok(output.includes('Retrieved study'));
});

it('should delete a DICOM study', async () => {
  const output = await tools.runAsync(
    `${cmd} dicomWebDeleteStudy ${datasetId} ${dicomStoreId} ${studyUid}`,
    cwd
  );
  assert.ok(output.includes('Deleted study'));
});
