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

/**
 * Creates a new model armor template with advanced SDP settings enabled.
 *
 * @param {string} projectId - Google Cloud project ID where the template will be created.
 * @param {string} locationId - Google Cloud location where the template will be created.
 * @param {string} templateId - ID for the template to create.
 * @param {string} inspectTemplate - Sensitive Data Protection inspect template resource name.
 * @param {string} deidentifyTemplate - Optional Sensitive Data Protection Deidentify template resource name.
 */
async function main(
  projectId,
  locationId,
  templateId,
  inspectTemplate,
  deidentifyTemplate
) {
  // [START modelarmor_create_template_with_advanced_sdp]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'us-central1';
  // const templateId = 'template-id';
  // const inspectTemplate = `projects/${projectId}/locations/${locationId}/inspectTemplates/inspect-template-id`;
  // const deidentifyTemplate = `projects/${projectId}/locations/${locationId}/deidentifyTemplates/deidentify-template-id`;

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Model Armor library
  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;

  // Access the enums from protos
  const RaiFilterType = protos.google.cloud.modelarmor.v1.RaiFilterType;
  const DetectionConfidenceLevel = protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel;

  // Instantiates a client
  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  async function callCreateTemplateWithAdvancedSdp() {
    // Configuration for the template with advanced SDP settings
    const templateConfig = {
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
          advancedConfig: {
            inspectTemplate: inspectTemplate,
            deidentifyTemplate: deidentifyTemplate,
          },
        },
      },
    };

    // Construct request
    const request = {
      parent,
      templateId,
      template: templateConfig,
    };

    // Create the template
    const [response] = await client.createTemplate(request);
    console.log(`Created template: ${response.name}`);
  }

  return callCreateTemplateWithAdvancedSdp();
  // [END modelarmor_create_template_with_advanced_sdp]
}

// Check if this script is being run directly
const args = process.argv.slice(2);
main(...args).catch(console.error);

// Example usage:
// node createTemplateWithAdvancedSdp.js ma-crest-data-test-2 us-east4 rudy456 basic-sdp-template basic-sdp-template