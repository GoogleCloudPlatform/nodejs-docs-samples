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
 * Sanitizes a user prompt using Model Armor filters.
 *
 * @param {string} projectId - Google Cloud project ID where the template exists.
 * @param {string} locationId - Google Cloud location (region) of the template.
 * @param {string} templateId - Identifier of the template to use for sanitization.
 * @param {string} userPrompt - The user's text prompt that needs to be sanitized.
 */
async function main(projectId, locationId, templateId, userPrompt) {
  const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  async function sanitizeUserPrompt() {
    const request = {
      name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
      userPromptData: {
        text: userPrompt,
      },
    };

    const [response] = await client.sanitizeUserPrompt(request);
    console.log(JSON.stringify(response, null, 2));
  }

  sanitizeUserPrompt();
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
