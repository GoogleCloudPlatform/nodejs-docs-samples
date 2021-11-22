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
const healthcare = require('@googleapis/healthcare');

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cloudRegion = 'us-central1';
const pubSubClient = new PubSub();
const storage = new Storage();
const topicName = `nodejs-healthcare-test-topic-${uuid.v4()}`;

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');

const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const fhirStoreId = `nodejs-docs-samples-test-fhir-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const version = 'STU3';

const fhirFileName = 'fhir_data.ndjson';

const fhirResourceFile = `resources/${fhirFileName}`;
const gcsUri = `${bucketName}/${fhirFileName}`;
const installDeps = 'npm install';

// Run npm install on datasets directory because modalities
// require bootstrapping datasets, and Kokoro needs to know
// to install dependencies from the datasets directory.
assert.ok(execSync(installDeps, {cwd: `${cwdDatasets}`, shell: true}));
let projectId;
before(async () => {
  projectId = await healthcare.auth.getProjectId();
  // Create a Cloud Storage bucket to be used for testing.
  await storage.createBucket(bucketName);
  console.log(`Bucket ${bucketName} created.`);
  // Upload the FHIR resource file so that there's something to
  // use for the importFhirResources test.
  await storage.bucket(bucketName).upload(fhirResourceFile);

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

it('should create a FHIR store', () => {
  const output = execSync(
    `node createFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${version}`,
    {cwd}
  );
  assert.ok(output.includes('Created FHIR store'));
});

it('should get a FHIR store', () => {
  const output = execSync(
    `node getFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('name'));
});

it('should list FHIR stores', () => {
  const output = execSync(
    `node listFhirStores.js ${projectId} ${cloudRegion} ${datasetId}`,
    {cwd}
  );
  assert.ok(output.includes('fhirStores'));
});

it('should patch a FHIR store', () => {
  const output = execSync(
    `node patchFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${topicName}`,
    {cwd}
  );
  assert.ok(output.includes('Patched FHIR store'));
});

it('should import FHIR resources into a FHIR store from Cloud Storage', () => {
  const output = execSync(
    `node importFhirResources.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${gcsUri}`,
    {cwd}
  );
  assert.ok(output.includes('Import FHIR resources succeeded'));
});

it('should export FHIR resources from a FHIR store to Cloud Storage', () => {
  const output = execSync(
    `node exportFhirResources.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${gcsUri}`,
    {cwd}
  );
  assert.ok(output.includes('Exported FHIR resources successfully'));
});

it('should create and get a FHIR store IAM policy', () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = execSync(
    `node setFhirStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${localMember} ${localRole}`,
    {cwd}
  );
  assert.ok(output.includes, 'ETAG');

  output = execSync(
    `node getFhirStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`
  );
  assert.ok(output.includes('dpebot'));
});

it('should delete a FHIR store', () => {
  const output = execSync(
    `node deleteFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`,
    {cwd}
  );
  assert.ok(output.includes('Deleted FHIR store'));
});
