/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('node:assert/strict');
const {before, describe, it} = require('mocha');
const cp = require('child_process');
const {RegionInstanceTemplatesClient} = require('@google-cloud/compute').v1;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('Regional instance template', async () => {
  const templateName = `regional-template-name-745d98${Math.floor(Math.random() * 10 + 1)}f`;
  const region = 'us-central1';
  const regionInstanceTemplatesClient = new RegionInstanceTemplatesClient();
  let projectId;

  before(async () => {
    projectId = await regionInstanceTemplatesClient.getProjectId();
  });

  it('should create a new template', () => {
    const response = execSync(
      `node ./create-instance-templates/createRegionalTemplate.js ${templateName}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Template: ${templateName} created.`));
  });

  it('should return template', () => {
    const response = JSON.parse(
      execSync(
        `node ./create-instance-templates/getRegionalTemplate.js ${templateName}`,
        {
          cwd,
        }
      )
    );

    assert(response.name === templateName);
  });

  it('should delete template', async () => {
    const response = execSync(
      `node ./create-instance-templates/deleteRegionalTemplate.js ${templateName}`,
      {
        cwd,
      }
    );

    assert(response.includes(`Template: ${templateName} deleted.`));

    try {
      // Try to get the deleted template
      await regionInstanceTemplatesClient.get({
        project: projectId,
        region,
        instanceTemplate: templateName,
      });

      // If the template is found, the test should fail
      throw new Error('Template was not deleted.');
    } catch (error) {
      // Assert that the error message indicates the template wasn't found
      const expected = `The resource 'projects/${projectId}/regions/${region}/instanceTemplates/${templateName}' was not found`;
      assert(error.message && error.message.includes(expected));
    }
  });
});
