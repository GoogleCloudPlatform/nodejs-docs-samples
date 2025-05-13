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

const {assert} = require('chai');
const cp = require('child_process');
const {v4: uuidv4} = require('uuid');
const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

let projectId;
const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const folderId = process.env.MA_FOLDER_ID;
const organizationId = process.env.MA_ORG_ID;
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

async function disableFloorSettings() {
  try {
    // Disable project floor settings
    const [projectFloorSettings] = await client.getFloorSetting({
      name: `projects/${projectId}/locations/global/floorSetting`,
    });

    if (projectFloorSettings.enableFloorSettingEnforcement) {
      const [updatedProjectSettings] = await client.updateFloorSetting({
        floorSetting: {
          name: `projects/${projectId}/locations/global/floorSetting`,
          enableFloorSettingEnforcement: false,
        },
        updateMask: {
          paths: ['enable_floor_setting_enforcement'],
        },
      });
      console.log(
        'Disabled project floor settings:',
        updatedProjectSettings.name
      );
    }

    // Disable folder floor settings if folderId is available
    if (folderId) {
      const [folderFloorSettings] = await client.getFloorSetting({
        name: `folders/${folderId}/locations/global/floorSetting`,
      });

      if (folderFloorSettings.enableFloorSettingEnforcement) {
        const [updatedFolderSettings] = await client.updateFloorSetting({
          floorSetting: {
            name: `folders/${folderId}/locations/global/floorSetting`,
            enableFloorSettingEnforcement: false,
          },
          updateMask: {
            paths: ['enable_floor_setting_enforcement'],
          },
        });
        console.log(
          'Disabled folder floor settings:',
          updatedFolderSettings.name
        );
      }
    }

    // Disable organization floor settings if organizationId is available
    if (organizationId) {
      const [orgFloorSettings] = await client.getFloorSetting({
        name: `organizations/${organizationId}/locations/global/floorSetting`,
      });

      if (orgFloorSettings.enableFloorSettingEnforcement) {
        const [updatedOrgSettings] = await client.updateFloorSetting({
          floorSetting: {
            name: `organizations/${organizationId}/locations/global/floorSetting`,
            enableFloorSettingEnforcement: false,
          },
          updateMask: {
            paths: ['enable_floor_setting_enforcement'],
          },
        });
        console.log(
          'Disabled organization floor settings:',
          updatedOrgSettings.name
        );
      }
    }
  } catch (error) {
    console.error('Error disabling floor settings:', error);
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
    // Disable floor settings to restore original state
    await disableFloorSettings();

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

  // =================== Floor Settings Tests ===================

  it('should get organization floor settings', () => {
    const output = execSync(
      `node snippets/getOrganizationFloorSettings.js ${organizationId}`
    ).toString();

    // Check for expected name format in output
    const expectedName = `organizations/${organizationId}/locations/global/floorSetting`;
    assert.match(output, new RegExp(expectedName.replace(/\//g, '\\/')));
  });

  it('should get folder floor settings', () => {
    const output = execSync(
      `node snippets/getFolderFloorSettings.js ${folderId}`
    ).toString();

    // Check for expected name format in output
    const expectedName = `folders/${folderId}/locations/global/floorSetting`;
    assert.match(output, new RegExp(expectedName.replace(/\//g, '\\/')));
  });

  it('should get project floor settings', () => {
    const output = execSync(
      `node snippets/getProjectFloorSettings.js ${projectId}`
    ).toString();

    // Check for expected name format in output
    const expectedName = `projects/${projectId}/locations/global/floorSetting`;
    assert.match(output, new RegExp(expectedName.replace(/\//g, '\\/')));
  });

  it('should update organization floor settings', () => {
    const output = execSync(
      `node snippets/updateOrganizationFloorSettings.js ${organizationId}`
    ).toString();

    // Check that the update was performed
    assert.match(output, /Updated organization floor settings/);

    // Check that the response contains enableFloorSettingEnforcement=true
    assert.match(output, /enableFloorSettingEnforcement:\s*true/);
  });

  it('should update folder floor settings', () => {
    const output = execSync(
      `node snippets/updateFolderFloorSettings.js ${folderId}`
    ).toString();

    // Check that the update was performed
    assert.match(output, /Updated folder floor settings/);

    // Check that the response contains enableFloorSettingEnforcement=true
    assert.match(output, /enableFloorSettingEnforcement:\s*true/);
  });

  it('should update project floor settings', () => {
    const output = execSync(
      `node snippets/updateProjectFloorSettings.js ${projectId}`
    ).toString();

    // Check that the update was performed
    assert.match(output, /Updated project floor settings/);

    // Check that the response contains enableFloorSettingEnforcement=true
    assert.match(output, /enableFloorSettingEnforcement:\s*true/);
  });
});
