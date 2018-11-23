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

const cmd = 'node templates.js';
const cwd = path.join(__dirname, '..');
const templateName = '';

const INFO_TYPE = 'PERSON_NAME';
const MIN_LIKELIHOOD = 'VERY_LIKELY';
const MAX_FINDINGS = 5;
const INCLUDE_QUOTE = false;
const DISPLAY_NAME = `My Template ${uuid.v4()}`;
const TEMPLATE_NAME = `my-template-${uuid.v4()}`;

const fullTemplateName = `projects/${
  process.env.GCLOUD_PROJECT
}/inspectTemplates/${TEMPLATE_NAME}`;

// create_inspect_template
it('should create template', async () => {
  const output = await tools.runAsync(
    `${cmd} create -m ${MIN_LIKELIHOOD} -t ${INFO_TYPE} -f ${MAX_FINDINGS} -q ${INCLUDE_QUOTE} -d "${DISPLAY_NAME}" -i "${TEMPLATE_NAME}"`,
    cwd
  );
  assert.strictEqual(
    output.includes(`Successfully created template ${fullTemplateName}`),
    true
  );
});

it('should handle template creation errors', async () => {
  const output = await tools.runAsync(
    `${cmd} create -i invalid_template#id`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in createInspectTemplate/).test(output),
    true
  );
});

// list_inspect_templates
it('should list templates', async () => {
  const output = await tools.runAsync(`${cmd} list`, cwd);
  assert.strictEqual(output.includes(`Template ${templateName}`), true);
  assert.strictEqual(
    new RegExp(/Created: \d{1,2}\/\d{1,2}\/\d{4}/).test(output),
    true
  );
  assert.strictEqual(
    new RegExp(/Updated: \d{1,2}\/\d{1,2}\/\d{4}/).test(output),
    true
  );
});

it('should pass creation settings to template', async () => {
  const output = await tools.runAsync(`${cmd} list`, cwd);
  assert.strictEqual(output.includes(`Template ${fullTemplateName}`), true);
  assert.strictEqual(output.includes(`Display name: ${DISPLAY_NAME}`), true);
  assert.strictEqual(output.includes(`InfoTypes: ${INFO_TYPE}`), true);
  assert.strictEqual(
    output.includes(`Minimum likelihood: ${MIN_LIKELIHOOD}`),
    true
  );
  assert.strictEqual(output.includes(`Include quotes: ${INCLUDE_QUOTE}`), true);
  assert.strictEqual(
    output.includes(`Max findings per request: ${MAX_FINDINGS}`),
    true
  );
});

// delete_inspect_template
it('should delete template', async () => {
  const output = await tools.runAsync(`${cmd} delete ${fullTemplateName}`, cwd);
  assert.strictEqual(
    output.includes(`Successfully deleted template ${fullTemplateName}.`),
    true
  );
});

it('should handle template deletion errors', async () => {
  const output = await tools.runAsync(`${cmd} delete BAD_TEMPLATE`, cwd);
  assert.strictEqual(
    new RegExp(/Error in deleteInspectTemplate/).test(output),
    true
  );
});
