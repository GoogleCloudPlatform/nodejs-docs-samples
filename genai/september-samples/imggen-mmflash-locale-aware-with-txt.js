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

// [START googlegenaisdk_imggen_mmflash_edit_img_with_txt_img]
const fs = require('fs');
const {GoogleGenAI, Modality} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

async function generateImage(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: 'Generate a photo of a breakfast meal.',
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  console.log(response);

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(`${part.text}`);
    } else if (part.inlineData) {
      const imageBytes = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync('example-breakfast-meal.png', imageBytes);
    }
  }

  return response;
}
// Example response:
// Generates a photo of a vibrant and appetizing breakfast meal.
// The scene will feature a white plate with golden-brown pancakes
// stacked neatly, drizzled with rich maple syrup and ...
// [END googlegenaisdk_imggen_mmflash_edit_img_with_txt_img]

module.exports = {
  generateImage,
};
