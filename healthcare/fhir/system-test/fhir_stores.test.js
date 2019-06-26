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

const {PubSub} = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');

const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const cloudRegion = 'us-central1';
const projectId = process.env.GCLOUD_PROJECT;
const pubSubClient = new PubSub({projectId});
const storage = new Storage();
const topicName = `nodejs-healthcare-test-topic-${uuid.v4()}`;

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');

const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const fhirStoreId = `nodejs-docs-samples-test-fhir-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

const fhirFileName = 'fhir_data.ndjson';

const fhirResourceFile = `resources/${fhirFileName}`;
const gcsUri = `${bucketName}/${fhirFileName}`;

before(async () => {
  tools.checkCredentials();
  // Create a Cloud Storage bucket to be used for testing.
  await storage.createBucket(bucketName);
  console.log(`Bucket ${bucketName} created.`);
  await storage.bucket(bucketName).upload(fhirResourceFile);

  // Create a Pub/Sub topic to be used for testing.
  const [topic] = await pubSubClient.createTopic(topicName);
  console.log(`Topic ${topic.name} created.`);
  await tools.runAsync(
    `node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwdDatasets
  );
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
    await tools.runAsync(
      `node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
      cwdDatasets
    );
  } catch (err) {} // Ignore error
});

it('should create a FHIR store', async () => {
  const output = await tools.runAsync(
    `node createFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.ok(output.includes('Created FHIR store'));
});

it('should get a FHIR store', async () => {
  const output = await tools.runAsync(
    `node getFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.ok(output.includes('name'));
});

it('should list FHIR stores', async () => {
  const output = await tools.runAsync(
    `node listFhirStores.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwd
  );
  assert.ok(output.includes('fhirStores'));
});

it('should patch a FHIR store', async () => {
  const output = await tools.runAsync(
    `node patchFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${topicName}`,
    cwd
  );
  assert.ok(output.includes('Patched FHIR store'));
});

it('should import FHIR resources into a FHIR store from Cloud Storage', async () => {
  const output = await tools.runAsync(
    `node importFhirResources.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${gcsUri}`,
    cwd
  );
  assert.ok(output.includes('Import FHIR resources succeeded'));
});

it('should export FHIR resources from a FHIR store to Cloud Storage', async () => {
  const output = await tools.runAsync(
    `node exportFhirResources.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${gcsUri}`,
    cwd
  );
  assert.ok(output.includes('Exported FHIR resources successfully'));
});

it('should create and get a FHIR store IAM policy', async () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = await tools.runAsync(
    `node setFhirStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${localMember} ${localRole}`,
    cwd
  );
  assert.ok(output.includes, 'ETAG');

  output = await tools.runAsync(
    `node getFhirStoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`
  );
  assert.ok(output.includes('dpebot'));
});

it('should delete a FHIR store', async () => {
  const output = await tools.runAsync(
    `node deleteFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.ok(output.includes('Deleted FHIR store'));
});
