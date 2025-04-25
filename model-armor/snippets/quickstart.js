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
 * Quickstart example for using Google Cloud Model Armor to
 * create a template with RAI filters and sanitize content.
 *
 * @param {string} projectId - Google Cloud project ID.
 * @param {string} locationId - Google Cloud location.
 * @param {string} templateId - ID for the template to create.
 */
async function quickstart(
  projectId = 'my-project',
  locationId = 'us-central1',
  templateId = 'my-template'
) {
  // [START modelarmor_quickstart]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'us-central1';
  // const templateId = 'my-template';

  // Imports the Model Armor library
  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;

  const {RaiFilterType} = protos.google.cloud.modelarmor.v1;
  const {DetectionConfidenceLevel} = protos.google.cloud.modelarmor.v1;

  // Instantiates a client
  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Build the Model Armor template with preferred filters
  // For more details on filters, refer to:
  // https://cloud.google.com/security-command-center/docs/key-concepts-model-armor#ma-filters
  const template = {
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
    },
  };

  const [createdTemplate] = await client.createTemplate({
    parent,
    templateId,
    template,
  });

  // Sanitize a user prompt using the created template
  const userPrompt = 'Unsafe user prompt';

  const [userPromptSanitizeResponse] = await client.sanitizeUserPrompt({
    name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
    userPromptData: {
      text: userPrompt,
    },
  });

  // Sanitize a model response using the created template
  const modelResponse = 'Unsanitized model output';

  const [modelSanitizeResponse] = await client.sanitizeModelResponse({
    name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
    modelResponseData: {
      text: modelResponse,
    },
  });

  return {
    templateName: createdTemplate.name,
    userPromptSanitizeResponse,
    modelSanitizeResponse
  };
  // [END modelarmor_quickstart]
}

module.exports = quickstart;
