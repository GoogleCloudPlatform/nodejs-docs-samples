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
const {PubSub} = require('@google-cloud/pubsub');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');
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
const projectId = process.env.GCLOUD_PROJECT;
const cloudRegion = 'us-central1';

const pubSubClient = new PubSub({projectId});

before(async () => {
  tools.checkCredentials();
  // Create a Pub/Sub topic to be used for testing.
  const [topic] = await pubSubClient.createTopic(pubsubTopic);
  console.log(`Topic ${topic.name} created.`);
  await tools.runAsync(
    `node createDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwdDatasets
  );
});

after(async () => {
  try {
    await pubSubClient.topic(pubsubTopic).delete();
    console.log(`Topic ${pubsubTopic} deleted.`);
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
  assert.strictEqual(new RegExp(/Created FHIR store/).test(output), true);
});

it('should get a FHIR store', async () => {
  const output = await tools.runAsync(
    `node getFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/name/).test(output), true);
});

it('should list FHIR stores', async () => {
  const output = await tools.runAsync(
    `node listFhirStores.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/fhirStores/).test(output), true);
});

it('should patch a FHIR store', async () => {
  const output = await tools.runAsync(
    `node patchFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId} ${pubsubTopic}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Patched FHIR store/).test(output), true);
});

it('should delete a FHIR store', async () => {
  const output = await tools.runAsync(
    `node deleteFhirStore.js ${projectId} ${cloudRegion} ${datasetId} ${fhirStoreId}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Deleted FHIR store/).test(output), true);
});
