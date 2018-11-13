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
const cmd = `node hl7v2_stores.js`;
const cwdDatasets = path.join(__dirname, `../../datasets`);
const cwd = path.join(__dirname, `..`);
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const hl7v2StoreId = `nodejs-docs-samples-test-hl7v2-store${uuid.v4()}`.replace(
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

test.serial(`should create an HL7v2 store`, async t => {
  const output = await tools.runAsync(
    `${cmd} createHl7v2Store ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  t.regex(output, /Created HL7v2 store/);
});

test.serial(`should get an HL7v2 store`, async t => {
  const output = await tools.runAsync(
    `${cmd} getHl7v2Store ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  t.regex(output, /Got HL7v2 store/);
});

test.serial(`should patch an HL7v2 store`, async t => {
  const output = await tools.runAsync(
    `${cmd} patchHl7v2Store ${datasetId} ${hl7v2StoreId} ${pubsubTopic}`,
    cwd
  );
  t.regex(output, /Patched HL7v2 store with Cloud Pub\/Sub topic/);
});

test.serial(`should list HL7v2 stores`, async t => {
  const output = await tools.runAsync(
    `${cmd} listHl7v2Stores ${datasetId}`,
    cwd
  );
  t.regex(output, /HL7v2 stores/);
});

test(`should delete an HL7v2 Store`, async t => {
  const output = await tools.runAsync(
    `${cmd} deleteHl7v2Store ${datasetId} ${hl7v2StoreId}`,
    cwd
  );
  t.regex(output, /Deleted HL7v2 store/);
});
