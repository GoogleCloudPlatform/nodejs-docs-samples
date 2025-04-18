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
 * Sanitizes a model response with context from the original user prompt.
 *
 * @param {string} projectId - Google Cloud project ID where the template exists.
 * @param {string} locationId - Google Cloud location (region) of the template, e.g., 'us-central1'.
 * @param {string} templateId - Identifier of the template to use for sanitization.
 * @param {string} modelResponse - The text response from a model that needs to be sanitized.
 * @param {string} userPrompt - The original user prompt that generated the model response.
 */
async function main(
  projectId,
  locationId,
  templateId,
  modelResponse,
  userPrompt
) {
  // [START modelarmor_sanitize_model_response_with_user_prompt]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = process.env.PROJECT_ID || 'your-project-id';
  // const locationId = process.env.LOCATION_ID || 'us-central1';
  // const templateId = process.env.TEMPLATE_ID || 'template-id';
  // const modelResponse = '';
  // const userPrompt = '';
  const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  async function sanitizeModelResponseWithUserPrompt() {
    const request = {
      name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
      modelResponseData: {
        text: modelResponse,
      },
      userPrompt: userPrompt,
    };

    const [response] = await client.sanitizeModelResponse(request);
    console.log(JSON.stringify(response, null, 2));
  }

  sanitizeModelResponseWithUserPrompt();
  // [START modelarmor_sanitize_model_response_with_user_prompt]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
