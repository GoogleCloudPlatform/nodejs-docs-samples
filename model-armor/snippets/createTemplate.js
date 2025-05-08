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

/**
 * Creates a Model Armor template with Responsible AI (RAI) filters.
 *
 * This function creates a template that can be used for sanitizing user prompts and model responses.
 *
 * @param {string} projectId - Google Cloud project ID where the template will be created.
 * @param {string} locationId - Google Cloud location (region) for the template, e.g., 'us-central1'.
 * @param {string} templateId - Unique identifier for the new template.
 */
async function createTemplate(projectId, locationId, templateId) {
  // [START modelarmor_create_template]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'us-central1';
  // const templateId = 'your-template-id';

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Model Armor library
  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;

  // Instantiates a client
  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  /**  Build the Model Armor template with your preferred filters.
      For more details on filters, please refer to the following doc:
      https://cloud.google.com/security-command-center/docs/key-concepts-model-armor#ma-filters
   */
  const templateConfig = {
    filterConfig: {
      raiSettings: {
        raiFilters: [
          {
            filterType:
              protos.google.cloud.modelarmor.v1.RaiFilterType.HATE_SPEECH,
            confidenceLevel:
              protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel.HIGH,
          },
          {
            filterType:
              protos.google.cloud.modelarmor.v1.RaiFilterType.SEXUALLY_EXPLICIT,
            confidenceLevel:
              protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel
                .MEDIUM_AND_ABOVE,
          },
        ],
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
  return response;
  // [END modelarmor_create_template]
}

module.exports = createTemplate;
