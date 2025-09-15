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

// [START googlegenaisdk_imggen_mmflash_txt_and_img_with_txt]
const fs = require('fs');
const {GoogleGenAI, Modality} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

async function savePaellaRecipe(response) {
  const parts = response.candidates[0].content.parts;
  const mdFile = 'paella-recipe.md';

  let mdText = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.text) {
      mdText += part.text + '\n';
    } else if (part.inlineData) {
      const imageBytes = Buffer.from(part.inlineData.data, 'base64');
      const imagePath = `example-image-${i + 1}.png`;
      fs.writeFileSync(imagePath, imageBytes);
      mdText += `![image](./${imagePath})\n`;
    }
  }

  fs.writeFileSync(mdFile, mdText);
  console.log(`Saved recepie to: ${mdFile}`);
}

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
    model: 'gemini-2.0-flash-preview-image-generation',
    contents:
      'Generate an illustrated recipe for a paella. Create images to go alongside the text as you generate the recipe',
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });
  console.log(response);

  await savePaellaRecipe(response);

  return response;
}
// Example response:
//  A markdown page for a Paella recipe(`paella-recipe.md`) has been generated.
//  It includes detailed steps and several images illustrating the cooking process.
// [END googlegenaisdk_imggen_mmflash_txt_and_img_with_txt]

module.exports = {
  generateImage,
};
