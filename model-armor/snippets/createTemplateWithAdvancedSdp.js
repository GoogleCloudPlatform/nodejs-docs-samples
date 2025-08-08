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
 * Creates a new model armor template with advanced SDP settings enabled.
 *
 * @param {string} projectId - Google Cloud project ID where the template will be created.
 * @param {string} locationId - Google Cloud location where the template will be created.
 * @param {string} templateId - ID for the template to create.
 * @param {string} inspectTemplate - Optional. Sensitive Data Protection inspect template resource name.
            If only inspect template is provided (de-identify template
            not provided), then Sensitive Data Protection InspectContent
            action is performed during Sanitization. All Sensitive Data
            Protection findings identified during inspection will be
            returned as SdpFinding in SdpInsepctionResult e.g.
            `organizations/{organization}/inspectTemplates/{inspect_template}`,
            `projects/{project}/inspectTemplates/{inspect_template}`
            `organizations/{organization}/locations/{location}/inspectTemplates/{inspect_template}`
            `projects/{project}/locations/{location}/inspectTemplates/{inspect_template}`
 * @param {string} deidentifyTemplate - Optional. Optional Sensitive Data Protection Deidentify template resource name.
            If provided then DeidentifyContent action is performed
            during Sanitization using this template and inspect
            template. The De-identified data will be returned in
            SdpDeidentifyResult. Note that all info-types present in the
            deidentify template must be present in inspect template.
            e.g.
            `organizations/{organization}/deidentifyTemplates/{deidentify_template}`,
            `projects/{project}/deidentifyTemplates/{deidentify_template}`
            `organizations/{organization}/locations/{location}/deidentifyTemplates/{deidentify_template}`
            `projects/{project}/locations/{location}/deidentifyTemplates/{deidentify_template}`
 */
async function createTemplateWithAdvancedSdp(
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

  const RaiFilterType = protos.google.cloud.modelarmor.v1.RaiFilterType;
  const DetectionConfidenceLevel =
    protos.google.cloud.modelarmor.v1.DetectionConfidenceLevel;

  // Instantiates a client
  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

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
  return response;
  // [END modelarmor_create_template_with_advanced_sdp]
}

module.exports = createTemplateWithAdvancedSdp;
