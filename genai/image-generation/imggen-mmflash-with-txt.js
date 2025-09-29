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

// [START googlegenaisdk_imggen_mmflash_with_txt]
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

  const response = await client.models.generateContentStream({
    model: 'gemini-2.0-flash-exp',
    contents:
      'Generate an image of the Eiffel tower with fireworks in the background.',
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const generatedFileNames = [];
  let imageIndex = 0;

  for await (const chunk of response) {
    const text = chunk.text;
    const data = chunk.data;
    if (text) {
      console.debug(text);
    } else if (data) {
      const outputDir = 'output-folder';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
      }
      const fileName = `${outputDir}/generate_content_streaming_image_${imageIndex++}.png`;
      console.debug(`Writing response image to file: ${fileName}.`);
      try {
        fs.writeFileSync(fileName, data);
        generatedFileNames.push(fileName);
      } catch (error) {
        console.error(`Failed to write image file ${fileName}:`, error);
      }
    }
  }

  // Example response:
  //  I will generate an image of the Eiffel Tower at night, with a vibrant display of
  //  colorful fireworks exploding in the dark sky behind it. The tower will be
  //  illuminated, standing tall as the focal point of the scene, with the bursts of
  //  light from the fireworks creating a festive atmosphere.

  return generatedFileNames;
}
// [END googlegenaisdk_imggen_mmflash_with_txt]

module.exports = {
  generateImage,
};
