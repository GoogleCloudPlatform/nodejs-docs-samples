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
const {PubSub} = require('@google-cloud/pubsub');
const pubSubClient = new PubSub({projectId});
const cloudRegion = 'us-central1';

const cwdDatasets = path.join(__dirname, '../../datasets');
const cwd = path.join(__dirname, '..');
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const hl7v2StoreId = `nodejs-docs-samples-test-hl7v2-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const topicName = `nodejs-healthcare-test-topic-${uuid.v4()}`;

before(async () => {
  tools.checkCredentials();
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
    await pubSubClient.topic(topicName).delete();
    console.log(`Topic ${topicName} deleted.`);
    await tools.runAsync(
      `node deleteDataset.js ${projectId} ${cloudRegion} ${datasetId}`,
      cwdDatasets
    );
  } catch (err) {} // Ignore error
});

it('should create an HL7v2 store', async () => {
  const output = await tools.runAsync(
    `node createHl7v2Store.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  assert.ok(output.includes('Created HL7v2 store'));
});

it('should get an HL7v2 store', async () => {
  const output = await tools.runAsync(
    `node getHl7v2Store.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  assert.ok(output.includes('name'));
});

it('should patch an HL7v2 store', async () => {
  const output = await tools.runAsync(
    `node patchHl7v2Store.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId} ${topicName}`,
    cwd
  );
  assert.ok(output.includes('Patched HL7v2 store'));
});

it('should list HL7v2 stores', async () => {
  const output = await tools.runAsync(
    `node listHl7v2Stores.js ${projectId} ${cloudRegion} ${datasetId}`,
    cwd
  );
  assert.ok(output.includes('hl7V2Stores'));
});

it('should create and get an HL7v2 store IAM policy', async () => {
  const localMember = 'group:dpebot@google.com';
  const localRole = 'roles/viewer';

  let output = await tools.runAsync(
    `node setHl7v2StoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId} ${localMember} ${localRole}`,
    cwd
  );
  assert.ok(output.includes, 'ETAG');

  output = await tools.runAsync(
    `node getHl7v2StoreIamPolicy.js ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId}`
  );
  assert.ok(output.includes('dpebot'));
});

it('should delete an HL7v2 Store', async () => {
  const output = await tools.runAsync(
    `node deleteHl7v2Store ${projectId} ${cloudRegion} ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  assert.ok(output.includes('Deleted HL7v2 store'));
});
