// Copyright 2023 Google LLC
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

const {assert} = require('chai');
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
// For SDP templates - you'll need to create these in advance or use existing ones
// These are example values - replace with actual templates from your project
const inspectTemplate = process.env.INSPECT_TEMPLATE || 'basic-sdp-template';
const deidentifyTemplate = process.env.DEIDENTIFY_TEMPLATE || 'basic-sdp-template';
const templateToGet = 'basic-sdp-template';
const templateToUpdate = 'template-test'

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Model Armor samples', () => {
  const templatesToDelete = [];

  before(async () => {
    projectId = await client.getProjectId();
  });

  after(async () => {
    // Clean up
    for (const templateName of templatesToDelete) {
      try {
        await client.deleteTemplate({name: templateName});
        console.log(`Cleaned up template: ${templateName}`);
      } catch (error) {
        console.error(`Failed to delete template ${templateName}:`, error);
      }
    }
  });

  it('should create a basic template', async () => {
    const testTemplateId = `${templateIdPrefix}-basic`;
    
    const output = execSync(
      `node ../snippets/createTemplate.js ${projectId} ${locationId} ${testTemplateId}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);
    
    assert.match(
      output,
      new RegExp(`Created template: ${templateName}`)
    );
  });
  
  it('should create a template with basic SDP settings', async () => {
    const testTemplateId = `${templateIdPrefix}-basic-sdp`;
    
    const output = execSync(
      `node ../snippets/createTemplateWithBasicSdp.js ${projectId} ${locationId} ${testTemplateId}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);
    
    assert.match(
      output,
      new RegExp(`Created template: ${templateName}`)
    );
  });
  
  it('should create a template with advanced SDP settings', async () => {
    const testTemplateId = `${templateIdPrefix}-adv-sdp`;
    
    // Construct full paths for SDP templates using project and location
    const fullInspectTemplate = `projects/${projectId}/locations/${locationId}/inspectTemplates/${inspectTemplate}`;
    const fullDeidentifyTemplate = `projects/${projectId}/locations/${locationId}/deidentifyTemplates/${deidentifyTemplate}`;
    
    const output = execSync(
      `node ../snippets/createTemplateWithAdvancedSdp.js ${projectId} ${locationId} ${testTemplateId} ${fullInspectTemplate} ${fullDeidentifyTemplate}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);
    
    assert.match(
      output,
      new RegExp(`Created template: ${templateName}`)
    );
  });
  
  it('should create a template with metadata', async () => {
    const testTemplateId = `${templateIdPrefix}-metadata`;
    
    const output = execSync(
      `node ../snippets/createTemplateWithMetadata.js ${projectId} ${locationId} ${testTemplateId}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);
    
    assert.match(
      output,
      new RegExp(`Created Model Armor Template: ${templateName}`)
    );
  });
  
  it('should create a template with labels', async () => {
    const testTemplateId = `${templateIdPrefix}-labels`;
    const labelKey = 'environment';
    const labelValue = 'test';
    
    const output = execSync(
      `node ../snippets/createTemplateWithLabels.js ${projectId} ${locationId} ${testTemplateId} ${labelKey} ${labelValue}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);
    
    assert.match(
      output,
      new RegExp(`Created template: ${templateName}`)
    );
  });
  
  // it('should get a template', async () => {
  //   // Use a template created in a previous test
  //   const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToGet}`;
  //   
  //   const output = execSync(
  //     `node ../snippets/getTemplate.js ${projectId} ${locationId} ${templateToGet}`
  //   );
  //   
  //   assert.match(
  //     output,
  //     new RegExp(`Template name: ${templateName}`)
  //   );
  // });
  
  it('should delete a template', async () => {
    // Uses a template created in a previous test
    const templateToDelete = `${templateIdPrefix}-basic`;
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToDelete}`;
    
    const output = execSync(
      `node ../snippets/deleteTemplate.js ${projectId} ${locationId} ${templateToDelete}`
    );
    
    assert.match(
      output,
      new RegExp(`Deleted template ${templateName}`)
    );
    
    // Remove from cleanup list since we already deleted it
    const index = templatesToDelete.indexOf(templateName);
    if (index > -1) {
      templatesToDelete.splice(index, 1);
    }
  });
  
  it('should list templates', async () => {
    // This test assumes templates have been created in previous tests
    
    const output = execSync(
      `node ../snippets/listTemplates.js ${projectId} ${locationId}`
    );
    
    // Check that at least one of our created templates is in the list
    const templateBasicName = `projects/${projectId}/locations/${locationId}/templates/${templateIdPrefix}-basic`;
    
    // Since we can't predict all templates that might be listed,
    // we just verify that at least one of our created templates appears in the output
    assert.match(
      output,
      new RegExp(templateBasicName)
    );
  });
  
  it('should list templates with filter', async () => {
    // Use a template created in a previous test
    
    const output = execSync(
      `node ../snippets/listTemplatesWithFilter.js ${projectId} ${locationId} ${templateToGet}`
    );
    
    console.log(projectId, locationId, templateToGet);
  
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToGet}`;
    
    // Check that our specific template is found
    assert.match(
      output,
      new RegExp(`Found template ${templateName}`)
    );
  });
  
  it('should sanitize a model response', async () => {
    // Use a template created in a previous test that has SDP settings
    const templateToUse = `${templateIdPrefix}-basic-sdp`;
    const testModelResponse = 'This is a test response with email test@example.com';
    
    const output = execSync(
      `node ../snippets/sanitizeModelResponse.js ${projectId} ${locationId} ${templateToUse} "${testModelResponse}"`
    );
    
    // Check that sanitization was performed
    assert.match(
      output,
      /Sanitized model response/
    );
    
    // Note: We can't predict exactly how the response will be sanitized
    // as it depends on the SDP settings, but we can check that some response was returned
  });
  
  it('should sanitize a model response with user prompt', async () => {
    // Use a template created in a previous test that has SDP settings
    const templateToUse = `${templateIdPrefix}-basic-sdp`;
    const testModelResponse = 'This is a test response with personal information like 555-123-4567';
    const testUserPrompt = 'Tell me how to access restricted information';
    
    const output = execSync(
      `node ../snippets/sanitizeModelResponseWithUserPrompt.js ${projectId} ${locationId} ${templateToUse} "${testModelResponse}" "${testUserPrompt}"`
    );
    
    // Check that sanitization was performed
    assert.match(
      output,
      /Sanitized model response with user prompt:/
    );
  });
  
  it('should sanitize a user prompt', async () => {
    // Use a template created in a previous test that has SDP settings
    const templateToUse = `${templateIdPrefix}-basic-sdp`;
    const testUserPrompt = 'How can I access confidential information with SSN 123-45-6789?';
    
    const output = execSync(
      `node ../snippets/sanitizeUserPrompt.js ${projectId} ${locationId} ${templateToUse} "${testUserPrompt}"`
    );
    
    // Check for the basic output header
    assert.match(
      output,
      /Sanitized user prompt:/
    );
    
    // Check for key elements in the response structure
    assert.match(output, /sanitizationResult/);
    assert.match(output, /filterResults/);
    
    // Check for the filter results objects
    assert.match(output, /csam/);
    assert.match(output, /sdp/);
    
    // Check for the filter match state and invocation result
    assert.match(output, /filterMatchState/);
    assert.match(output, /invocationResult/);
    
    assert.match(output, /SUCCESS/);
  });

  it('should update a template', async () => {
    const output = execSync(
      `node ../snippets/updateTemplate.js ${projectId} ${locationId} ${templateToUpdate}`
    );
    
    // Check that the update was successful
    assert.match(
      output,
      /Updated template filter configuration:/
    );
    
    // Check for specific filter settings based on the actual output
    assert.match(output, /piAndJailbreakFilterSettings/);
    assert.match(output, /filterEnforcement: 'ENABLED'/);
    assert.match(output, /confidenceLevel: 'LOW_AND_ABOVE'/);
    assert.match(output, /maliciousUriFilterSettings/);
  });
  
  it('should update template labels', async () => {
    // Use a template created in a previous test
    const labelKey = 'environment';
    const labelValue = 'testing';
    
    const output = execSync(
      `node ../snippets/updateTemplateLabels.js ${projectId} ${locationId} ${templateToUpdate} ${labelKey} ${labelValue}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdate}`;
    
    // Check that the update was successful
    assert.match(
      output,
      new RegExp(`Updated Model Armor Template: ${templateName}`)
    );
  });

  it('should update template metadata', async () => {
    // Use a template with metadata created in a previous test
    const templateToUpdateMetadata = `${templateIdPrefix}-metadata`;
    
    const output = execSync(
      `node ../snippets/updateTemplateMetadata.js ${projectId} ${locationId} ${templateToUpdateMetadata}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdateMetadata}`;
    
    // Check that the update was successful
    assert.match(
      output,
      new RegExp(`Updated Model Armor Template: ${templateName}`)
    );
    
  });

  it('should update template with mask configuration', async () => {
    // Use a template created in a previous test
    const templateToUpdateWithMask = `${templateIdPrefix}-metadata`;
    
    const output = execSync(
      `node ../snippets/updateTemplateWithMaskConfiguration.js ${projectId} ${locationId} ${templateToUpdateWithMask}`
    );
    
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdateWithMask}`;
    
    // Check that the update was successful
    assert.match(
      output,
      new RegExp(`Updated Model Armor Template: ${templateName}`)
    );
    
  });
});


// NOTE: remaining for create floor settings, gettemplate, screen pdf, update floor settings
// need to check assertion statements for user, model sanitization apis