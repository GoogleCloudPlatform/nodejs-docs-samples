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

const FILE_NAME = 'test-data/example-image-eiffel-tower.png';

async function generateImage(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const imageBytes = fs.readFileSync(FILE_NAME);

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageBytes.toString('base64'),
            },
          },
          {
            text: 'Edit this image to make it look like a cartoon',
          },
        ],
      },
    ],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(`${part.text}`);
    } else if (part.inlineData) {
      const outputDir = 'output-folder';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
      }
      const imageBytes = Buffer.from(part.inlineData.data, 'base64');
      const filename = `${outputDir}/bw-example-image.png`;
      fs.writeFileSync(filename, imageBytes);
    }
  }

  // Example response:
  // Okay, I will edit this image to give it a cartoonish style, with bolder outlines, simplified details, and more vibrant colors.
  return response;
}

// [END googlegenaisdk_imggen_mmflash_edit_img_with_txt_img]

module.exports = {
  generateImage,
};
