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
 * Updates the labels of an existing model armor template.
 *
 * @param {string} projectId - Google Cloud project ID where the template exists.
 * @param {string} locationId - Google Cloud location where the template exists.
 * @param {string} templateId - ID of the template to update.
 * @param {string} labelKey - The key for the label to add or update.
 * @param {string} labelValue - The value for the label to add or update.
 */
async function main(
  projectId,
  locationId,
  templateId,
  labelKey,
  labelValue
) {
  // [START modelarmor_update_template_with_labels]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'us-central1';
  // const templateId = 'template-id';
  // const labelKey = 'env';
  // const labelValue = 'prod';

  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;

  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  async function callUpdateTemplateWithLabels() {
    const labels = {};
    labels[labelKey] = labelValue;

    const template = {
      name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
      labels: labels,
    };

    const updateMask = {
      paths: ['labels'],
    };

    const request = {
      template: template,
      updateMask: updateMask,
    };

    const [response] = await client.updateTemplate(request);
    console.log(`Updated Model Armor Template: ${response.name}`);
  }

  return callUpdateTemplateWithLabels();
  // [END modelarmor_update_template_with_labels]
}

// Check if this script is being run directly
const args = process.argv.slice(2);
main(...args).catch(console.error);

// Example usage:
// node updateTemplateLabels.js ma-crest-data-test-2 us-central1 rudy-template-with-label env prod

// --need to check