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

const {PubSub} = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cloudRegion = 'us-central1';
const pubSubClient = new PubSub();
const storage = new Storage();
const topicName = `nodejs-healthcare-test-topic-${uuid.v4()}`;

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');

const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const dicomStoreId = `nodejs-docs-samples-test-dicom-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const dcmFileName = 'IM-0002-0001-JPEG-BASELINE.dcm';

const resourceFile = `resources/${dcmFileName}`;
const gcsUri = `${bucketName}/${dcmFileName}`;
const installDeps = 'npm install';
let projectId;

// Run npm install on datasets directory because modalities
// require bootstrapping datasets, and Kokoro needs to know
// to install dependencies from the datasets directory.
assert.ok(execSync(installDeps, {cwd: `${cwdDatasets}`, shell: true}));

before(async () => {
  projectId = await storage.getProjectId();
  console.log(`THE PROJECT ID IS ${projectId}`);
  // Create a Cloud Storage bucket to be used for testing.
  await storage.createBucket(bucketName);
  console.log(`Bucket ${bucketName} created.`);
  await storage.bucket(bucketName).upload(resourceFile);

  // Create a Pub/Sub topic to be used for testing.
  const [topic] = await pubSubClient.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);
  execSync(`node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`, {
    cwd: cwdDatasets,
  });
});

after(async () => {
  try {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.deleteFiles({force: true}); // Try a second time...
    await bucket.delete();
    console.log(`Bucket ${bucketName} deleted.`);

    await pubSubClient.topic(topicName).delete();
    console.log(`Topic ${topicName} deleted.`);
    execSync(`node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`, {
      cwd: cwdDatasets,
    });
  } catch (err) {
    // ignore error
  }
});

it('should create a DICOM store', () => {
  const output = execSync(
    `node createDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('Created DICOM store'));
});

it('should get a DICOM store', () => {
  const output = execSync(
    `node getDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('name'));
});

it('should patch a DICOM store', () => {
  const output = execSync(
    `node patchDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${topicName}`,
    {cwd}
  );
  assert.ok(output.includes('Patched DICOM store'));
});

it('should list DICOM stores', () => {
  const output = execSync(
    `node listDicomStores.js ${projectId} ${cloudRegion} ${datasetId}`,
    {cwd}
  );
  assert.ok(output.includes('dicomStores'));
});

it('should create and get a DICOM store IAM policy', () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = execSync(
    `node setDicomStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${localMember} ${localRole}`,
    {cwd}
  );
  assert.ok(output.includes, 'ETAG');

  output = execSync(
    `node getDicomStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`
  );
  assert.ok(output.includes('dpebot'));
});

it('should import a DICOM object from GCS', () => {
  const output = execSync(
    `node importDicomInstance.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${gcsUri}`,
    {cwd}
  );
  assert.ok(output.includes('Successfully imported DICOM instances'));
});

it('should export a DICOM instance', () => {
  const output = execSync(
    `node exportDicomInstanceGcs.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId} ${bucketName}`,
    {cwd}
  );
  assert.ok(output.includes('Exported DICOM instances'));
});

it('should delete a DICOM store', () => {
  const output = execSync(
    `node deleteDicomStore.js ${projectId} ${cloudRegion} ${datasetId} ${dicomStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('Deleted DICOM store'));
});
