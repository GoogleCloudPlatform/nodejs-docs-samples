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
 * Updates an existing model armor template.
 *
 * @param {string} projectId - Google Cloud project ID where the template exists.
 * @param {string} locationId - Google Cloud location where the template exists.
 * @param {string} templateId - ID of the template to update.
 */
async function main(
  projectId,
  locationId,
  templateId
) {
  // [START modelarmor_update_template]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'us-central1';
  // const templateId = 'template-id';

  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;

  const DetectionConfidenceLevel = protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel;
  const PiAndJailbreakFilterEnforcement = protos.google.cloud.modelarmor.v1.PiAndJailbreakFilterSettings.PiAndJailbreakFilterEnforcement;
  const MaliciousUriFilterEnforcement = protos.google.cloud.modelarmor.v1.MaliciousUriFilterSettings.MaliciousUriFilterEnforcement;

  // Instantiates a client
  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  async function callUpdateTemplate() {
    // Build the updated template configuration
    const updatedTemplate = {
      name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
      filterConfig: {
        piAndJailbreakFilterSettings: {
          filterEnforcement: PiAndJailbreakFilterEnforcement.ENABLED,
          confidenceLevel: DetectionConfidenceLevel.LOW_AND_ABOVE,
        },
        maliciousUriFilterSettings: {
          filterEnforcement: MaliciousUriFilterEnforcement.ENABLED,
        },
      },
    };

    const request = {
      template: updatedTemplate,
    };

    const [response] = await client.updateTemplate(request);
    console.log('Updated template filter configuration:', response.filterConfig);
  }

  return callUpdateTemplate();
  // [END modelarmor_update_template]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);

// Example usage:
// node updateTemplate.js ma-crest-data-test-2 us-east4 rudy-metadata-template