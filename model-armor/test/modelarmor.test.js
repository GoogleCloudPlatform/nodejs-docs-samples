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
    projectId = await client.getProjectId();

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
    const createTemplate = require('../snippets/createTemplate');

    const response = await createTemplate(
      projectId,
      locationId,
      testTemplateId
    );
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.strictEqual(response.name, templateName);
  });

  it('should create a template with basic SDP settings', async () => {
    const testTemplateId = `${templateIdPrefix}-basic-sdp-1`;
    const createTemplateWithBasicSdp = require('../snippets/createTemplateWithBasicSdp');

    const response = await createTemplateWithBasicSdp(
      projectId,
      locationId,
      testTemplateId
    );
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.strictEqual(response.name, templateName);
  });

  it('should create a template with advanced SDP settings', async () => {
    const testTemplateId = `${templateIdPrefix}-adv-sdp`;
    const inspectTemplate = basicSdpTemplateId;
    const deidentifyTemplate = basicSdpTemplateId;
    const createTemplateWithAdvancedSdp = require('../snippets/createTemplateWithAdvancedSdp');

    const fullInspectTemplate = `projects/${projectId}/locations/${locationId}/inspectTemplates/${inspectTemplate}`;
    const fullDeidentifyTemplate = `projects/${projectId}/locations/${locationId}/deidentifyTemplates/${deidentifyTemplate}`;

    const response = await createTemplateWithAdvancedSdp(
      projectId,
      locationId,
      testTemplateId,
      fullInspectTemplate,
      fullDeidentifyTemplate
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.strictEqual(response.name, templateName);
  });

  it('should create a template with metadata', async () => {
    const testTemplateId = `${templateIdPrefix}-metadata`;
    const createTemplateWithMetadata = require('../snippets/createTemplateWithMetadata');

    const response = await createTemplateWithMetadata(
      projectId,
      locationId,
      testTemplateId
    );
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.strictEqual(response.name, templateName);
  });

  it('should create a template with labels', async () => {
    const testTemplateId = `${templateIdPrefix}-labels`;
    const labelKey = 'environment';
    const labelValue = 'test';
    const createTemplateWithLabels = require('../snippets/createTemplateWithLabels');

    const response = await createTemplateWithLabels(
      projectId,
      locationId,
      testTemplateId,
      labelKey,
      labelValue
    );

    const templateName = `projects/${projectId}/locations/${locationId}/templates/${testTemplateId}`;
    templatesToDelete.push(templateName);

    assert.strictEqual(response.name, templateName);
  });

  // =================== Template Management Tests ===================

  it('should get a template', async () => {
    const templateToGet = `${templateIdPrefix}-basic-sdp`;
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToGet}`;

    const getTemplate = require('../snippets/getTemplate');
    const template = await getTemplate(projectId, locationId, templateToGet);

    assert.strictEqual(template.name, templateName);
  });

  it('should delete a template', async () => {
    const deleteTemplate = require('../snippets/deleteTemplate');
    const response = await deleteTemplate(
      projectId,
      locationId,
      templateToDeleteId
    );
    assert.isArray(response);
    assert.isObject(response[0]);
    assert.isNull(response[1]);
    assert.isNull(response[2]);

    assert.deepEqual(response[0], {});
  });

  it('should list templates', async () => {
    const listTemplates = require('../snippets/listTemplates');
    const templates = await listTemplates(projectId, locationId);

    const hasMatchingTemplate = templates.some(template =>
      template.name.includes(templateIdPrefix)
    );

    assert.isTrue(
      hasMatchingTemplate,
      `Should find at least one template with prefix ${templateIdPrefix}`
    );
  });

  it('should list templates with filter', async () => {
    const templateToGet = `${templateIdPrefix}-basic-sdp`;
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToGet}`;

    const listTemplatesWithFilter = require('../snippets/listTemplatesWithFilter');
    const templates = await listTemplatesWithFilter(
      projectId,
      locationId,
      templateToGet
    );
    // Should find exactly one template
    assert.strictEqual(templates.length, 1);
    assert.strictEqual(templates[0].name, templateName);
  });

  // =================== Template Update Tests ===================

  it('should update a template', async () => {
    const templateToUpdate = `${templateIdPrefix}-basic-create`;

    const updateTemplate = require('../snippets/updateTemplate');
    const response = await updateTemplate(
      projectId,
      locationId,
      templateToUpdate
    );
    assert.property(response, 'filterConfig');
    assert.property(response.filterConfig, 'piAndJailbreakFilterSettings');
    assert.property(response.filterConfig, 'maliciousUriFilterSettings');

    const piSettings = response.filterConfig.piAndJailbreakFilterSettings;
    assert.strictEqual(piSettings.filterEnforcement, 'ENABLED');
    assert.strictEqual(piSettings.confidenceLevel, 'LOW_AND_ABOVE');

    const uriSettings = response.filterConfig.maliciousUriFilterSettings;
    assert.strictEqual(uriSettings.filterEnforcement, 'ENABLED');
  });

  it('should update template labels', async () => {
    const labelKey = 'environment';
    const labelValue = 'testing';
    const templateToUpdate = `${templateIdPrefix}-basic-create`;
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdate}`;

    const updateTemplateWithLabels = require('../snippets/updateTemplateLabels');
    const response = await updateTemplateWithLabels(
      projectId,
      locationId,
      templateToUpdate,
      labelKey,
      labelValue
    );

    assert.strictEqual(response.name, templateName);
    assert.property(response, 'labels');
  });

  it('should update template metadata', async () => {
    const templateToUpdateMetadata = `${templateIdPrefix}-metadata`;
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdateMetadata}`;

    const updateTemplateMetadata = require('../snippets/updateTemplateMetadata');
    const response = await updateTemplateMetadata(
      projectId,
      locationId,
      templateToUpdateMetadata
    );
    assert.strictEqual(response.name, templateName);

    assert.property(response, 'templateMetadata');
    assert.property(
      response.templateMetadata,
      'ignorePartialInvocationFailures'
    );
    assert.property(response.templateMetadata, 'logSanitizeOperations');
    assert.strictEqual(
      response.templateMetadata.ignorePartialInvocationFailures,
      true
    );
    assert.strictEqual(response.templateMetadata.logSanitizeOperations, false);
  });

  it('should update template with mask configuration', async () => {
    const templateToUpdateWithMask = `${templateIdPrefix}-metadata`;
    const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateToUpdateWithMask}`;

    const updateTemplateWithMaskConfiguration = require('../snippets/updateTemplateWithMaskConfiguration');
    const response = await updateTemplateWithMaskConfiguration(
      projectId,
      locationId,
      templateToUpdateWithMask
    );

    assert.strictEqual(response.name, templateName);

    assert.property(response, 'filterConfig');
    assert.property(response.filterConfig, 'piAndJailbreakFilterSettings');
    assert.property(response.filterConfig, 'maliciousUriFilterSettings');

    const piSettings = response.filterConfig.piAndJailbreakFilterSettings;
    assert.strictEqual(piSettings.filterEnforcement, 'ENABLED');
    assert.strictEqual(piSettings.confidenceLevel, 'LOW_AND_ABOVE');
  });
});
