/**
 * Copyright 2017, Google, Inc.
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

const test = require(`ava`);
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require(`uuid`);

const projectId = process.env.GCLOUD_PROJECT;
const cmd = `node triggers.js`;
const triggerName = `my-trigger-${uuid.v4()}`;
const fullTriggerName = `projects/${projectId}/jobTriggers/${triggerName}`;
const triggerDisplayName = `My Trigger Display Name: ${uuid.v4()}`;
const triggerDescription = `My Trigger Description: ${uuid.v4()}`;

const infoType = `US_CENSUS_NAME`;
const minLikelihood = `VERY_LIKELY`;
const maxFindings = 5;
const bucketName = process.env.BUCKET_NAME;

test.serial(`should create a trigger`, async t => {
  const output = await tools.runAsync(
    `${cmd} create ${bucketName} 1 -n ${triggerName} --autoPopulateTimespan \
    -m ${minLikelihood} -t ${infoType} -f ${maxFindings} -d "${triggerDisplayName}" -s "${triggerDescription}"`
  );
  t.true(output.includes(`Successfully created trigger ${fullTriggerName}`));
});

test.serial(`should list triggers`, async t => {
  const output = await tools.runAsync(`${cmd} list`);
  t.true(output.includes(`Trigger ${fullTriggerName}`));
  t.true(output.includes(`Display Name: ${triggerDisplayName}`));
  t.true(output.includes(`Description: ${triggerDescription}`));
  t.regex(output, /Created: \d{1,2}\/\d{1,2}\/\d{4}/);
  t.regex(output, /Updated: \d{1,2}\/\d{1,2}\/\d{4}/);
  t.regex(output, /Status: HEALTHY/);
  t.regex(output, /Error count: 0/);
});

test.serial(`should delete a trigger`, async t => {
  const output = await tools.runAsync(`${cmd} delete ${fullTriggerName}`);
  t.true(output.includes(`Successfully deleted trigger ${fullTriggerName}.`));
});

test(`should handle trigger creation errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} create ${bucketName} 1 -n "@@@@@" -m ${minLikelihood} -t ${infoType} -f ${maxFindings}`
  );
  t.regex(output, /Error in createTrigger/);
});

test(`should handle trigger deletion errors`, async t => {
  const output = await tools.runAsync(`${cmd} delete bad-trigger-path`);
  t.regex(output, /Error in deleteTrigger/);
});
