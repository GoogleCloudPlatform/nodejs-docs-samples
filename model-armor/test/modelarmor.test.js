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

let emptyTemplateId;
let basicTemplateId;
let basicSdpTemplateId;
let templateToDeleteId;

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

// Helper function to create a template for sanitization tests
async function createTemplate(templateId, filterConfig) {
  const parent = `projects/${projectId}/locations/${locationId}`;

  try {
    const [response] = await client.createTemplate({
      parent: parent,
      templateId: templateId,
      template: {
        filterConfig: filterConfig,
      },
    });

    console.log(`Created template: ${response.name}`);
    return response;
  } catch (error) {
    console.error(`Error creating template ${templateId}:`, error);
    throw error;
  }
}

// Helper function to delete a template
async function deleteTemplate(templateName) {
  try {
    await client.deleteTemplate({
      name: templateName,
    });
    console.log(`Deleted template: ${templateName}`);
  } catch (error) {
    if (error.code === 5) {
      // Not found
      console.log(`Template ${templateName} was not found.`);
    } else {
      console.error(`Error deleting template ${templateName}:`, error);
    }
  }
}

describe('Model Armor tests', () => {
  const templatesToDelete = [];

  before(async () => {
    // projectId = await client.getProjectId();
    projectId = 'ma-crest-data-test-2';

    // Import necessary enums
    const {protos} = require('@google-cloud/modelarmor');
    const DetectionConfidenceLevel =
      protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel;
    const PiAndJailbreakFilterEnforcement =
      protos.google.cloud.modelarmor.v1.PiAndJailbreakFilterSettings
        .PiAndJailbreakFilterEnforcement;
    const MaliciousUriFilterEnforcement =
      protos.google.cloud.modelarmor.v1.MaliciousUriFilterSettings
        .MaliciousUriFilterEnforcement;
    const RaiFilterType = protos.google.cloud.modelarmor.v1.RaiFilterType;
    const SdpBasicConfigEnforcement =
      protos.google.cloud.modelarmor.v1.SdpBasicConfig
        .SdpBasicConfigEnforcement;

    // Create empty template for sanitizeUserPrompt tests
    emptyTemplateId = `${templateIdPrefix}-empty`;
    await createTemplate(emptyTemplateId, {});

    // Create basic template with PI/Jailbreak and Malicious URI filters for sanitizeUserPrompt tests
    basicTemplateId = `${templateIdPrefix}-basic`;
    await createTemplate(basicTemplateId, {
      piAndJailbreakFilterSettings: {
        filterEnforcement: PiAndJailbreakFilterEnforcement.ENABLED,
        confidenceLevel: DetectionConfidenceLevel.MEDIUM_AND_ABOVE,
      },
      maliciousUriFilterSettings: {
        filterEnforcement: MaliciousUriFilterEnforcement.ENABLED,
      },
    });

    // Create a template to be deleted
    templateToDeleteId = `${templateIdPrefix}-to-delete`;
    await createTemplate(templateToDeleteId, {
      piAndJailbreakFilterSettings: {
        filterEnforcement: PiAndJailbreakFilterEnforcement.ENABLED,
        confidenceLevel: DetectionConfidenceLevel.MEDIUM_AND_ABOVE,
      },
      maliciousUriFilterSettings: {
        filterEnforcement: MaliciousUriFilterEnforcement.ENABLED,
      },
    });

    // Create a basic SDP template for testing
    basicSdpTemplateId = `${templateIdPrefix}-basic-sdp`;
    await createTemplate(basicSdpTemplateId, {
      filterConfig: {
        raiSettings: {
          raiFilters: [
            {
              filterType: RaiFilterType.DANGEROUS,
              confidenceLevel: DetectionConfidenceLevel.HIGH,
            },
            {
              filterType: RaiFilterType.HARASSMENT,
              confidenceLevel: DetectionConfidenceLevel.MEDIUM_AND_ABOVE,
            },
            {
              filterType: RaiFilterType.HATE_SPEECH,
              confidenceLevel: DetectionConfidenceLevel.HIGH,
            },
            {
              filterType: RaiFilterType.SEXUALLY_EXPLICIT,
              confidenceLevel: DetectionConfidenceLevel.HIGH,
            },
          ],
        },
        sdpSettings: {
          basicConfig: {
            filterEnforcement: SdpBasicConfigEnforcement.ENABLED,
          },
        },
      },
    });

    templatesToDelete.push(
      `projects/${projectId}/locations/${locationId}/templates/${emptyTemplateId}`,
      `projects/${projectId}/locations/${locationId}/templates/${basicTemplateId}`,
      `projects/${projectId}/locations/${locationId}/templates/${basicSdpTemplateId}`
    );
  });

  after(async () => {
    // Clean up all templates
    const directTemplates = [emptyTemplateId, basicTemplateId];
    for (const templateId of directTemplates) {
      await deleteTemplate(
        `projects/${projectId}/locations/${locationId}/templates/${templateId}`
      );
    }

    for (const templateName of templatesToDelete) {
      try {
        await client.deleteTemplate({name: templateName});
        console.log(`Cleaned up template: ${templateName}`);
      } catch (error) {
        console.error(`Failed to delete template ${templateName}:`, error);
      }
    }
  });

  // =================== Template Creation Tests ===================

  it('should create a basic template', async () => {
    const testTemplateId = `${templateIdPrefix}-basic-create`;

    const output = execSync(
      `node snippets/createTemplate.js ${projectId} ${locationId} ${testTemplateId}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.match(output, new RegExp(`Created template: ${templateName}`));
  });

  it('should create a template with basic SDP settings', async () => {
    const testTemplateId = `${templateIdPrefix}-basic-sdp-1`;

    const output = execSync(
      `node snippets/createTemplateWithBasicSdp.js ${projectId} ${locationId} ${testTemplateId}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.match(output, new RegExp(`Created template: ${templateName}`));
  });

  it('should create a template with advanced SDP settings', async () => {
    const testTemplateId = `${templateIdPrefix}-adv-sdp`;
    const inspectTemplate = basicSdpTemplateId;
    const deidentifyTemplate = basicSdpTemplateId;

    const fullInspectTemplate = `projects/${projectId}/locations/${locationId}/inspectTemplates/${inspectTemplate}`;
    const fullDeidentifyTemplate = `projects/${projectId}/locations/${locationId}/deidentifyTemplates/${deidentifyTemplate}`;

    const output = execSync(
      `node snippets/createTemplateWithAdvancedSdp.js ${projectId} ${locationId} ${testTemplateId} ${fullInspectTemplate} ${fullDeidentifyTemplate}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.match(output, new RegExp(`Created template: ${templateName}`));
  });

  it('should create a template with metadata', async () => {
    const testTemplateId = `${templateIdPrefix}-metadata`;

    const output = execSync(
      `node snippets/createTemplateWithMetadata.js ${projectId} ${locationId} ${testTemplateId}`
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
      `node snippets/createTemplateWithLabels.js ${projectId} ${locationId} ${testTemplateId} ${labelKey} ${labelValue}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.match(output, new RegExp(`Created template: ${templateName}`));
  });

  // =================== Template Management Tests ===================

  it('should get a template', async () => {
    const templateToGet = `${templateIdPrefix}-basic-sdp`;
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToGet}`;
    const output = execSync(
      `node snippets/getTemplate.js ${projectId} ${locationId} ${templateToGet}`
    );

    assert.match(output, new RegExp(`Template name: ${templateName}`));
  });

  it('should delete a template', async () => {
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToDeleteId}`;

    const output = execSync(
      `node snippets/deleteTemplate.js ${projectId} ${locationId} ${templateToDeleteId}`
    );

    assert.match(output, new RegExp(`Deleted template ${templateName}`));
  });

  it('should list templates', async () => {
    const output = execSync(
      `node snippets/listTemplates.js ${projectId} ${locationId}`
    );

    const templateNamePattern = `projects/${projectId}/locations/${locationId}/templates/${templateIdPrefix}`;

    assert.match(output, new RegExp(templateNamePattern));
  });

  it('should list templates with filter', async () => {
    const templateToGet = `${templateIdPrefix}-basic-sdp`;
    const output = execSync(
      `node snippets/listTemplatesWithFilter.js ${projectId} ${locationId} ${templateToGet}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToGet}`;

    assert.match(output, new RegExp(`Found template ${templateName}`));
  });

  // =================== Template Update Tests ===================

  it('should update a template', async () => {
    const templateToUpdate = `${templateIdPrefix}-basic-create`;
    const output = execSync(
      `node snippets/updateTemplate.js ${projectId} ${locationId} ${templateToUpdate}`
    );

    assert.match(output, /Updated template filter configuration:/);

    assert.match(output, /piAndJailbreakFilterSettings/);
    assert.match(output, /filterEnforcement: 'ENABLED'/);
    assert.match(output, /confidenceLevel: 'LOW_AND_ABOVE'/);
    assert.match(output, /maliciousUriFilterSettings/);
  });

  it('should update template labels', async () => {
    const labelKey = 'environment';
    const labelValue = 'testing';
    const templateToUpdate = `${templateIdPrefix}-basic-create`;

    const output = execSync(
      `node snippets/updateTemplateLabels.js ${projectId} ${locationId} ${templateToUpdate} ${labelKey} ${labelValue}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdate}`;

    assert.match(
      output,
      new RegExp(`Updated Model Armor Template: ${templateName}`)
    );
  });

  it('should update template metadata', async () => {
    const templateToUpdateMetadata = `${templateIdPrefix}-metadata`;

    const output = execSync(
      `node snippets/updateTemplateMetadata.js ${projectId} ${locationId} ${templateToUpdateMetadata}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdateMetadata}`;

    assert.match(
      output,
      new RegExp(`Updated Model Armor Template: ${templateName}`)
    );
  });

  it('should update template with mask configuration', async () => {
    const templateToUpdateWithMask = `${templateIdPrefix}-metadata`;

    const output = execSync(
      `node snippets/updateTemplateWithMaskConfiguration.js ${projectId} ${locationId} ${templateToUpdateWithMask}`
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdateWithMask}`;

    assert.match(
      output,
      new RegExp(`Updated Model Armor Template: ${templateName}`)
    );
  });

});
