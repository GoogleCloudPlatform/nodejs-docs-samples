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
 * Creates a new model armor template with template metadata.
 *
 * @param {string} projectId - Google Cloud project ID where the template will be created.
 * @param {string} locationId - Google Cloud location where the template will be created.
 * @param {string} templateId - ID for the template to create.
 */
async function main(
  projectId,
  locationId,
  templateId
) {
  // [START modelarmor_create_template_with_metadata]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'us-central1';
  // const templateId = 'template-id';

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

  async function callCreateTemplateWithMetadata() {
    // Configuration for the template with metadata
    const templateConfig = {
      filterConfig: {
        raiSettings: {
          raiFilters: [
            {
              filterType: RaiFilterType.HATE_SPEECH,
              confidenceLevel: DetectionConfidenceLevel.HIGH,
            },
            {
              filterType: RaiFilterType.SEXUALLY_EXPLICIT,
              confidenceLevel: DetectionConfidenceLevel.MEDIUM_AND_ABOVE,
            },
          ],
        },
      },
      templateMetadata: {
        ignorePartialInvocationFailures: true,
        logSanitizeOperations: true,
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
    console.log(`Created Model Armor Template: ${response.name}`);
  }

  return callCreateTemplateWithMetadata();
  // [END modelarmor_create_template_with_metadata]
}

// Check if this script is being run directly
const args = process.argv.slice(2);
main(...args).catch(console.error);

// Example usage:
// node createTemplateWithMetadata.js ma-crest-data-test-2 us-east4 rudy-metadata-template