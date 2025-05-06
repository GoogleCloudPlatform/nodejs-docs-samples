// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const cp = require('child_process');
const {v4: uuidv4} = require('uuid');
const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const options = {
  apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
};

const client = new ModelArmorClient(options);
const templateIdPrefix = `test-template-${uuidv4().substring(0, 8)}`;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Model Armor tests', () => {
  const templatesToDelete = [];

  before(async () => {
    projectId = await client.getProjectId();
  });

  after(async () => {
    // Clean up all templates
    for (const templateName of templatesToDelete) {
      try {
        await client.deleteTemplate({name: templateName});
        console.log(`Cleaned up template: ${templateName}`);
      } catch (error) {
        console.error(`Failed to delete template ${templateName}:`, error);
      }
    }
  });

  // =================== Quickstart Tests ===================

  it('should create a template and sanitize content', async () => {
    const quickstart = require('../snippets/quickstart');
    const testQuickstartTemplateId = `${templateIdPrefix}-quickstart`;

    await quickstart(
      projectId,
      locationId,
      testQuickstartTemplateId
    );

    templatesToDelete.push(
      `projects/${projectId}/locations/${locationId}/templates/${testQuickstartTemplateId}`
    );
  });
});
