/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
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
const cmd = 'node triggers.js';
const cwd = path.join(__dirname, '..');
const triggerName = `my-trigger-${uuid.v4()}`;
const fullTriggerName = `projects/${projectId}/jobTriggers/${triggerName}`;
const triggerDisplayName = `My Trigger Display Name: ${uuid.v4()}`;
const triggerDescription = `My Trigger Description: ${uuid.v4()}`;

const infoType = 'US_CENSUS_NAME';
const minLikelihood = 'VERY_LIKELY';
const maxFindings = 5;
const bucketName = process.env.BUCKET_NAME;

it('should create a trigger', async () => {
  const output = await tools.runAsync(
    `${cmd} create ${bucketName} 1 -n ${triggerName} --autoPopulateTimespan \
    -m ${minLikelihood} -t ${infoType} -f ${maxFindings} -d "${triggerDisplayName}" -s "${triggerDescription}"`,
    cwd
  );
  assert.strictEqual(
    output.includes(`Successfully created trigger ${fullTriggerName}`),
    true
  );
});

it('should list triggers', async () => {
  const output = await tools.runAsync(`${cmd} list`, cwd);
  assert.strictEqual(output.includes(`Trigger ${fullTriggerName}`), true);
  assert.strictEqual(
    output.includes(`Display Name: ${triggerDisplayName}`),
    true
  );
  assert.strictEqual(
    output.includes(`Description: ${triggerDescription}`),
    true
  );
  assert.strictEqual(
    new RegExp(/Created: \d{1,2}\/\d{1,2}\/\d{4}/).test(output),
    true
  );
  assert.strictEqual(
    new RegExp(/Updated: \d{1,2}\/\d{1,2}\/\d{4}/).test(output),
    true
  );
  assert.strictEqual(new RegExp(/Status: HEALTHY/).test(output), true);
  assert.strictEqual(new RegExp(/Error count: 0/).test(output), true);
});

it('should delete a trigger', async () => {
  const output = await tools.runAsync(`${cmd} delete ${fullTriggerName}`, cwd);
  assert.strictEqual(
    output.includes(`Successfully deleted trigger ${fullTriggerName}.`),
    true
  );
});

it('should handle trigger creation errors', async () => {
  const output = await tools.runAsync(
    `${cmd} create ${bucketName} 1 -n "@@@@@" -m ${minLikelihood} -t ${infoType} -f ${maxFindings}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Error in createTrigger/).test(output), true);
});

it('should handle trigger deletion errors', async () => {
  const output = await tools.runAsync(`${cmd} delete bad-trigger-path`, cwd);
  assert.strictEqual(new RegExp(/Error in deleteTrigger/).test(output), true);
});
