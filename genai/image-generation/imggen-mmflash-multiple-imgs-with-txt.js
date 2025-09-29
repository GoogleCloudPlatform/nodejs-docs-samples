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

// [START googlegenaisdk_imggen_mmflash_multiple_imgs_with_txt]
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
    contents: 'Generate 3 images of a cat sitting on a chair.',
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  console.log(response);

  const generatedFileNames = [];
  let imageCounter = 1;

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const outputDir = 'output-folder';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
      }
      const imageBytes = Buffer.from(part.inlineData.data, 'base64');
      const filename = `${outputDir}/example-cats-0${imageCounter}.png`;
      fs.writeFileSync(filename, imageBytes);
      generatedFileNames.push(filename);
      console.log(`Saved image: ${filename}`);

      imageCounter++;
    }
  }

  return generatedFileNames;
}
// Example response:
//  Image 1: A fluffy calico cat with striking green eyes is perched elegantly on a vintage wooden
//  chair with a woven seat. Sunlight streams through a nearby window, casting soft shadows and
//  highlighting the cat's fur.
//
//  Image 2: A sleek black cat with intense yellow eyes is sitting upright on a modern, minimalist
//  white chair. The background is a plain grey wall, putting the focus entirely on the feline's
//  graceful posture.
//
//  Image 3: A ginger tabby cat with playful amber eyes is comfortably curled up asleep on a plush,
//  oversized armchair upholstered in a soft, floral fabric. A corner of a cozy living room with a
// [END googlegenaisdk_imggen_mmflash_multiple_imgs_with_txt]

module.exports = {
  generateImage,
};
