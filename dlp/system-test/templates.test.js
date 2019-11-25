// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node templates.js';
const templateName = '';

describe('templates', () => {
  const INFO_TYPE = 'PERSON_NAME';
  const MIN_LIKELIHOOD = 'VERY_LIKELY';
  const MAX_FINDINGS = 5;
  const INCLUDE_QUOTE = false;
  const DISPLAY_NAME = `My Template ${uuid.v4()}`;
  const TEMPLATE_NAME = `my-template-${uuid.v4()}`;

  const fullTemplateName = `projects/${process.env.GCLOUD_PROJECT}/inspectTemplates/${TEMPLATE_NAME}`;

  // create_inspect_template
  it('should create template', () => {
    const output = execSync(
      `${cmd} create -m ${MIN_LIKELIHOOD} -t ${INFO_TYPE} -f ${MAX_FINDINGS} -q ${INCLUDE_QUOTE} -d "${DISPLAY_NAME}" -i "${TEMPLATE_NAME}"`
    );
    assert.include(output, `Successfully created template ${fullTemplateName}`);
  });

  it('should handle template creation errors', () => {
    const output = execSync(`${cmd} create -i invalid_template#id`);
    assert.match(output, /Error in createInspectTemplate/);
  });

  // list_inspect_templates
  it('should list templates', () => {
    const output = execSync(`${cmd} list`);
    assert.include(output, `Template ${templateName}`);
    assert.match(output, /Created: \d{1,2}\/\d{1,2}\/\d{4}/);
    assert.match(output, /Updated: \d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should pass creation settings to template', () => {
    const output = execSync(`${cmd} list`);
    assert.include(output, `Template ${fullTemplateName}`);
    assert.include(output, `Display name: ${DISPLAY_NAME}`);
    assert.include(output, `InfoTypes: ${INFO_TYPE}`);
    assert.include(output, `Minimum likelihood: ${MIN_LIKELIHOOD}`);
    assert.include(output, `Include quotes: ${INCLUDE_QUOTE}`);
    assert.include(output, `Max findings per request: ${MAX_FINDINGS}`);
  });

  // delete_inspect_template
  it('should delete template', () => {
    const output = execSync(`${cmd} delete ${fullTemplateName}`);
    assert.include(
      output,
      `Successfully deleted template ${fullTemplateName}.`
    );
  });

  it('should handle template deletion errors', () => {
    const output = execSync(`${cmd} delete BAD_TEMPLATE`);
    assert.match(output, /Error in deleteInspectTemplate/);
  });
});
