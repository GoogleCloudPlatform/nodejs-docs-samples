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
 * Updates the metadata of an existing model armor template.
 *
 * @param {string} projectId - Google Cloud project ID where the template exists.
 * @param {string} locationId - Google Cloud location where the template exists.
 * @param {string} templateId - ID of the template to update.
 */
async function updateTemplateMetadata(projectId, locationId, templateId) {
  // [START modelarmor_update_template_metadata]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'us-central1';
  // const templateId = 'template-id';

  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;

  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  const DetectionConfidenceLevel =
    protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel;
  const PiAndJailbreakFilterEnforcement =
    protos.google.cloud.modelarmor.v1.PiAndJailbreakFilterSettings
      .PiAndJailbreakFilterEnforcement;
  const MaliciousUriFilterEnforcement =
    protos.google.cloud.modelarmor.v1.MaliciousUriFilterSettings
      .MaliciousUriFilterEnforcement;

  const templateName = `projects/${projectId}/locations/${locationId}/templates/${templateId}`;

  const template = {
    name: templateName,
    filterConfig: {
      piAndJailbreakFilterSettings: {
        filterEnforcement: PiAndJailbreakFilterEnforcement.ENABLED,
        confidenceLevel: DetectionConfidenceLevel.LOW_AND_ABOVE,
      },
      maliciousUriFilterSettings: {
        filterEnforcement: MaliciousUriFilterEnforcement.ENABLED,
      },
    },
    templateMetadata: {
      ignorePartialInvocationFailures: true,
      logSanitizeOperations: false,
    },
  };

  const request = {
    template: template,
  };

  const [response] = await client.updateTemplate(request);
  return response;
  // [END modelarmor_update_template_metadata]
}

module.exports = updateTemplateMetadata;
