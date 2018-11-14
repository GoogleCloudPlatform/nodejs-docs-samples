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
const cmdFhirStores = `node fhir_stores.js`;
const cmd = 'node fhir_resources.js';
const cwd = path.join(__dirname, '..');
const cwdDatasets = path.join(__dirname, `../../datasets`);
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const fhirStoreId = `nodejs-docs-samples-test-fhir-store${uuid.v4()}`.replace(
  /-/gi,
  '_'
);
const resourceType = 'Patient';
let resourceId;

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

test.serial(`should create a FHIR resource`, async t => {
  await tools.runAsync(
    `${cmdFhirStores} createFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
  const output = await tools.runAsync(
    `${cmd} createResource ${datasetId} ${fhirStoreId} ${resourceType}`,
    cwd
  );
  const createdMessage = new RegExp(
    `Created resource ${resourceType} with ID (.*).`
  );
  t.regex(output, createdMessage);
  resourceId = createdMessage.exec(output)[1];
});

test.serial(`should get a FHIR resource`, async t => {
  const output = await tools.runAsync(
    `${cmd} getResource ${datasetId} ${fhirStoreId} ${resourceType} ${resourceId}`,
    cwd
  );
  t.regex(output, new RegExp(`Got ${resourceType} resource`));
});

test.serial(`should update a FHIR resource`, async t => {
  const output = await tools.runAsync(
    `${cmd} updateResource ${datasetId} ${fhirStoreId} ${resourceType} ${resourceId}`,
    cwd
  );
  t.is(output, `Updated ${resourceType} with ID ${resourceId}`);
});

test.serial(`should patch a FHIR resource`, async t => {
  const output = await tools.runAsync(
    `${cmd} patchResource ${datasetId} ${fhirStoreId} ${resourceType} ${resourceId}`,
    cwd
  );
  t.is(output, `Patched ${resourceType} with ID ${resourceId}`);
});

test.serial(`should delete a FHIR resource`, async t => {
  const output = await tools.runAsync(
    `${cmd} deleteResource ${datasetId} ${fhirStoreId} ${resourceType} ${resourceId}`,
    cwd
  );
  t.is(output, `Deleted ${resourceType} with ID ${resourceId}.`);

  // Clean up
  await tools.runAsync(
    `${cmdFhirStores} deleteFhirStore ${datasetId} ${fhirStoreId}`,
    cwd
  );
});
