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
 * Lists Model Armor templates that match a specific filter criteria.
 *
 * @param {string} projectId - Google Cloud project ID to list templates from.
 * @param {string} locationId - Google Cloud location (region) to list templates from, e.g., 'us-central1'.
 * @param {string} templateId - Template ID to filter by. Only templates with this ID will be returned.
 */
async function listTemplatesWithFilter(projectId, locationId, templateId) {
  // [START modelarmor_list_templates_with_filter]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const locationId = 'your-location-id';
  // const templateId = 'your-template-id';

  const parent = `projects/${projectId}/locations/${locationId}`;

  // Imports the Model Armor library
  const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

  // Instantiates a client
  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  const request = {
    parent: parent,
    filter: `name="${parent}/templates/${templateId}"`,
  };

  // Run request and collect all results
  const templates = [];
  const iterable = await client.listTemplatesAsync(request);

  for await (const template of iterable) {
    templates.push(template);
  }

  return templates;
  // [END modelarmor_list_templates_with_filter]
}

module.exports = listTemplatesWithFilter;
