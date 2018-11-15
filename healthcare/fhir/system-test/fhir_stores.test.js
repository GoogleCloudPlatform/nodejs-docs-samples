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
const cmd = `node fhir_stores.js`;
const cwdDatasets = path.join(__dirname, `../../datasets`);
const cwd = path.join(__dirname, `..`);
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const fhirStoreId = `nodejs-docs-samples-test-fhir-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const pubsubTopic = `nodejs-docs-samples-test-pubsub${uuid.v4()}`.replace(
  /-/gi,
  '_'
);

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

test.serial(`should create a FHIR store`, async t => {
  const output = await tools.runAsync(
    `${cmd} createFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  t.regex(output, /Created FHIR store/);
});

test.serial(`should get a FHIR store`, async t => {
  const output = await tools.runAsync(
    `${cmd} getFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  t.regex(output, /Got FHIR store/);
});

test.serial(`should list FHIR stores`, async t => {
  const output = await tools.runAsync(
    `${cmd} listFhirStores ${datasetId}`,
    cwd
  );
  t.regex(output, /FHIR stores/);
});

test.serial(`should patch a FHIR store`, async t => {
  const output = await tools.runAsync(
    `${cmd} patchFhirStore ${datasetId} ${fhirStoreId} ${pubsubTopic}`,
    cwd
  );
  t.regex(output, /Patched FHIR store/);
});

test.serial(`should get FHIR store metadata`, async t => {
  const output = await tools.runAsync(
    `${cmd} getMetadata ${datasetId} ${fhirStoreId}`,
    cwd
  );
  t.regex(output, /Capabilities statement for FHIR store/);
});

test(`should delete a FHIR store`, async t => {
  const output = await tools.runAsync(
    `${cmd} deleteFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  t.regex(output, /Deleted FHIR store/);
});
