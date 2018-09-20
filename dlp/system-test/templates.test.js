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

const cmd = `node templates.js`;
const templateName = '';

const INFO_TYPE = `PERSON_NAME`;
const MIN_LIKELIHOOD = `VERY_LIKELY`;
const MAX_FINDINGS = 5;
const INCLUDE_QUOTE = false;
const DISPLAY_NAME = `My Template ${uuid.v4()}`;
const TEMPLATE_NAME = `my-template-${uuid.v4()}`;

const fullTemplateName = `projects/${
  process.env.GCLOUD_PROJECT
}/inspectTemplates/${TEMPLATE_NAME}`;

// create_inspect_template
test.serial(`should create template`, async t => {
  const output = await tools.runAsync(
    `${cmd} create -m ${MIN_LIKELIHOOD} -t ${INFO_TYPE} -f ${MAX_FINDINGS} -q ${INCLUDE_QUOTE} -d "${DISPLAY_NAME}" -i "${TEMPLATE_NAME}"`
  );
  t.true(output.includes(`Successfully created template ${fullTemplateName}`));
});

test(`should handle template creation errors`, async t => {
  const output = await tools.runAsync(`${cmd} create -i invalid_template#id`);
  t.regex(output, /Error in createInspectTemplate/);
});

// list_inspect_templates
test.serial(`should list templates`, async t => {
  const output = await tools.runAsync(`${cmd} list`);
  t.true(output.includes(`Template ${templateName}`));
  t.regex(output, /Created: \d{1,2}\/\d{1,2}\/\d{4}/);
  t.regex(output, /Updated: \d{1,2}\/\d{1,2}\/\d{4}/);
});

test.serial(`should pass creation settings to template`, async t => {
  const output = await tools.runAsync(`${cmd} list`);
  t.true(output.includes(`Template ${fullTemplateName}`));
  t.true(output.includes(`Display name: ${DISPLAY_NAME}`));
  t.true(output.includes(`InfoTypes: ${INFO_TYPE}`));
  t.true(output.includes(`Minimum likelihood: ${MIN_LIKELIHOOD}`));
  t.true(output.includes(`Include quotes: ${INCLUDE_QUOTE}`));
  t.true(output.includes(`Max findings per request: ${MAX_FINDINGS}`));
});

// delete_inspect_template
test.serial(`should delete template`, async t => {
  const output = await tools.runAsync(`${cmd} delete ${fullTemplateName}`);
  t.true(output.includes(`Successfully deleted template ${fullTemplateName}.`));
});

test(`should handle template deletion errors`, async t => {
  const output = await tools.runAsync(`${cmd} delete BAD_TEMPLATE`);
  t.regex(output, /Error in deleteInspectTemplate/);
});
