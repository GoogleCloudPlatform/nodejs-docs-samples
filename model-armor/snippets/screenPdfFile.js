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
 * Sanitize/Screen PDF file content using the Model Armor API.
 *
 * @param {string} projectId - Google Cloud project ID.
 * @param {string} locationId - Google Cloud location.
 * @param {string} templateId - The template ID used for sanitization.
 * @param {string} pdfContentFilename - Path to a PDF file.
 */
async function screenPdfFile(
  projectId,
  locationId,
  templateId,
  pdfContentFilename
) {
  // [START modelarmor_screen_pdf_file]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = process.env.PROJECT_ID || 'your-project-id';
  // const locationId = process.env.LOCATION_ID || 'us-central1';
  // const templateId = process.env.TEMPLATE_ID || 'template-id';
  // const pdfContentFilename = 'path/to/file.pdf';

  // Imports the Model Armor library
  const modelarmor = require('@google-cloud/modelarmor');
  const {ModelArmorClient} = modelarmor.v1;
  const {protos} = modelarmor;
  const ByteItemType =
    protos.google.cloud.modelarmor.v1.ByteDataItem.ByteItemType;

  const fs = require('fs');

  const pdfContent = fs.readFileSync(pdfContentFilename);
  const pdfContentBase64 = pdfContent.toString('base64');

  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  const request = {
    name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
    userPromptData: {
      byteItem: {
        byteDataType: ByteItemType.PDF,
        byteData: pdfContentBase64,
      },
    },
  };

  const [response] = await client.sanitizeUserPrompt(request);
  console.log(JSON.stringify(response, null, 2));
  return response;
  // [END modelarmor_screen_pdf_file]
}

module.exports = screenPdfFile;
