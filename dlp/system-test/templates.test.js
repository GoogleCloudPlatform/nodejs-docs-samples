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
const {describe, it, before} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');
const DLP = require('@google-cloud/dlp');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const templateName = '';
const client = new DLP.DlpServiceClient();

describe('templates', () => {
  let projectId;
  let fullTemplateName;
  const INFO_TYPE = 'PERSON_NAME';
  const MIN_LIKELIHOOD = 'VERY_LIKELY';
  const MAX_FINDINGS = 5;
  const INCLUDE_QUOTE = false;
  const DISPLAY_NAME = `My Template ${uuid.v4()}`;
  const TEMPLATE_NAME = `my-template-${uuid.v4()}`;

  before(async () => {
    projectId = await client.getProjectId();
    fullTemplateName = `projects/${projectId}/locations/global/inspectTemplates/${TEMPLATE_NAME}`;
  });

  // create_inspect_template
  it('should create template', () => {
    const output = execSync(
      `node createInspectTemplate.js ${projectId} "${TEMPLATE_NAME}" "${DISPLAY_NAME}" ${INFO_TYPE} ${INCLUDE_QUOTE} ${MIN_LIKELIHOOD} ${MAX_FINDINGS}`
    );
    console.log(output);
    assert.include(output, `Successfully created template ${fullTemplateName}`);
  });

  it('should handle template creation errors', () => {
    let output;
    try {
      output = execSync(
        `node createInspectTemplate.js ${projectId} invalid_template#id`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // list_inspect_templates
  it('should list templates', () => {
    const output = execSync(`node listInspectTemplates.js ${projectId}`);
    assert.include(output, `Template ${templateName}`);
    assert.match(output, /Created: \d{1,2}\/\d{1,2}\/\d{4}/);
    assert.match(output, /Updated: \d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should pass creation settings to template', () => {
    const output = execSync(`node listInspectTemplates.js ${projectId}`);
    assert.include(output, fullTemplateName);
    assert.include(output, DISPLAY_NAME);
    assert.include(output, INFO_TYPE);
    assert.include(output, MIN_LIKELIHOOD);
    assert.include(output, MAX_FINDINGS);
  });

  // delete_inspect_template
  it('should delete template', () => {
    const output = execSync(
      `node deleteInspectTemplate.js ${projectId} ${fullTemplateName}`
    );
    assert.include(
      output,
      `Successfully deleted template ${fullTemplateName}.`
    );
  });

  it('should handle template deletion errors', () => {
    let output;
    try {
      output = execSync(
        `node deleteInspectTemplate.js ${projectId} BAD_TEMPLATE`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });
});
