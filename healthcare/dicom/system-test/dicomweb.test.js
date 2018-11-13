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

const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cmdDataset = `node datasets.js`;
const cmdDicomStore = `node dicom_stores.js`;
const cmd = `node dicomweb.js`;
const cwdDatasets = path.join(__dirname, `../../datasets`);
const cwd = path.join(__dirname, `..`);
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const dicomStoreId = `nodejs-docs-samples-test-dicom-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

const dcmFile = `resources/IM-0002-0001-JPEG-BASELINE-edited.dcm`;
const boundary = `DICOMwebBoundary`;
// The studyUid is not assigned by the server and is part of the metadata
// of dcmFile.
const studyUid = `1.2.840.113619.2.176.3596.3364818.7819.1259708454.105`;

test.before(tools.checkCredentials);
test.before(async () => {
  return tools
    .runAsync(`${cmdDataset} createDataset ${datasetId}`, cwdDatasets)
    .then(results => {
      console.log(results);
      return results;
    });
});
test.after.always(async () => {
  try {
    await tools.runAsync(
      `${cmdDataset} deleteDataset ${datasetId}`,
      cwdDatasets
    );
  } catch (err) {} // Ignore error
});

test.serial(`should store a DICOM instance`, async t => {
  await tools.runAsync(
    `${cmdDicomStore} createDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  const output = await tools.runAsync(
    `${cmd} dicomWebStoreInstance ${datasetId} ${dicomStoreId} ${dcmFile} ${boundary}`,
    cwd
  );
  t.regex(output, /Stored instance/);
});

test.serial(`should search DICOM instances`, async t => {
  const output = await tools.runAsync(
    `${cmd} dicomWebSearchInstances ${datasetId} ${dicomStoreId}`,
    cwd
  );
  t.regex(output, /Instances/);
});

test.serial(`should retrieve a DICOM study`, async t => {
  const output = await tools.runAsync(
    `${cmd} dicomWebRetrieveStudy ${datasetId} ${dicomStoreId} ${studyUid}`,
    cwd
  );
  t.regex(output, /Retrieved study/);
});

test.serial(`should delete a DICOM study`, async t => {
  const output = await tools.runAsync(
    `${cmd} dicomWebDeleteStudy ${datasetId} ${dicomStoreId} ${studyUid}`,
    cwd
  );
  t.regex(output, /Deleted study/);

  // Clean up
  await tools.runAsync(
    `${cmdDicomStore} deleteDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
});
