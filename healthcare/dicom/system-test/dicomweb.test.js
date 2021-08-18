// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require('path');
const assert = require('assert');
const uuid = require('uuid');
const {execSync} = require('child_process');
const google = require('@googleapis/healthcare');

let projectId;
const cloudRegion = 'us-central1';

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-dicomweb-${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const dicomStoreId =
  `nodejs-docs-samples-test-dicomweb-dicom-store${uuid.v4()}`.replace(
    /-/gi,
    '_'
  );

const dcmFile = 'resources/IM-0002-0001-JPEG-BASELINE.dcm';

// The Uids are not assigned by the server and are part of the metadata
// of dcmFile.
const studyUid = '1.2.840.113619.2.176.3596.3364818.7819.1259708454.105';
const seriesUid = '1.2.840.113619.2.176.3596.3364818.7819.1259708454.108';
const instanceUid = '1.2.840.113619.2.176.3596.3364818.7271.1259708501.876';

const installDeps = 'npm install';

// Run npm install on datasets directory because modalities
// require bootstrapping datasets, and Kokoro needs to know
// to install dependencies from the datasets directory.
assert.ok(execSync(installDeps, {cwd: `${cwdDatasets}`, shell: true}));

before(async () => {
  projectId = await google.auth.getProjectId();
  console.log(`THE PROJECT ID IS ${projectId}`);
  execSync(`node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`, {
    cwd: cwdDatasets,
  });
  execSync(
    `node createDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
    {cwd}
  );
});
after(() => {
  try {
    execSync(
      `node deleteDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
      {cwd}
    );
    execSync(`node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`, {
      cwd: cwdDatasets,
    });
  } catch (err) {
    // ignore error
  }
});

it('should store a DICOM instance', () => {
  const output = execSync(
    `node dicomWebStoreInstance.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${dcmFile}`,
    {cwd}
  );
  assert.ok(output.includes('Stored DICOM instance'));
});

it('should search DICOM instances', () => {
  const output = execSync(
    `node dicomWebSearchForInstances.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('Found'));
});

it('should retrieve a DICOM study', () => {
  const output = execSync(
    `node dicomWebRetrieveStudy.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${studyUid}`,
    {cwd}
  );
  assert.ok(output.includes('Retrieved study'));
});

it('should retrieve a DICOM instance', () => {
  const output = execSync(
    `node dicomWebRetrieveInstance.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${studyUid} ${seriesUid} ${instanceUid}`,
    {cwd}
  );
  assert.ok(output.includes('Retrieved DICOM instance'));
});

it('should retrieve a DICOM rendered PNG image', () => {
  const output = execSync(
    `node dicomWebRetrieveRendered.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${studyUid} ${seriesUid} ${instanceUid}`,
    {cwd}
  );
  assert.ok(output.includes('Retrieved rendered image'));
});

it('should search for DICOM studies', () => {
  const output = execSync(
    `node dicomWebSearchStudies.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('Found'));
});

it('should delete a DICOM study', () => {
  const output = execSync(
    `node dicomWebDeleteStudy.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${studyUid}`,
    {cwd}
  );
  assert.ok(output.includes('Deleted DICOM study'));
});
