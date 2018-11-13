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
const cmd = `node dicom_stores.js`;
const cwdDatasets = path.join(__dirname, `../../datasets`);
const cwd = path.join(__dirname, `..`);
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
const contentUri = bucketName + '/' + dcmFileName;

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

test.serial(`should create a DICOM store`, async t => {
  const output = await tools.runAsync(
    `${cmd} createDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  t.regex(output, /Created DICOM store/);
});

test.serial(`should get a DICOM store`, async t => {
  const output = await tools.runAsync(
    `${cmd} getDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  t.regex(output, /Got DICOM store/);
});

test.serial(`should patch a DICOM store`, async t => {
  const output = await tools.runAsync(
    `${cmd} patchDicomStore ${datasetId} ${dicomStoreId} ${pubsubTopic}`,
    cwd
  );
  t.regex(output, /Patched DICOM store with Cloud Pub\/Sub topic/);
});

test.serial(`should list DICOM stores`, async t => {
  const output = await tools.runAsync(
    `${cmd} listDicomStores ${datasetId}`,
    cwd
  );
  t.regex(output, /DICOM stores/);
});

test.serial(`should export a DICOM instance`, async t => {
  const output = await tools.runAsync(
    `${cmd} exportDicomInstanceGcs ${datasetId} ${dicomStoreId} ${bucketName}`,
    cwd
  );
  t.regex(output, /Exported DICOM instances to bucket/);
});

test.serial(`should import a DICOM object from GCS`, async t => {
  const output = await tools.runAsync(
    `${cmd} importDicomObject ${datasetId} ${dicomStoreId} ${contentUri}`,
    cwd
  );
  t.regex(output, /Imported DICOM objects from bucket/);
});

test(`should delete a DICOM store`, async t => {
  const output = await tools.runAsync(
    `${cmd} deleteDicomStore ${datasetId} ${dicomStoreId}`,
    cwd
  );
  t.regex(output, /Deleted DICOM store/);
});
