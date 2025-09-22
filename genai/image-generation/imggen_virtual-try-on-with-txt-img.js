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

// [START googlegenaisdk_imggen_virtual_try_on_with_txt_img]
const fs = require('fs');
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

async function virtualTryOn(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const source = {
    personImage: {
      imageBytes: fs.readFileSync('test-data/man.png').toString('base64'),
    },
    productImages: [
      {
        productImage: {
          imageBytes: fs
            .readFileSync('test-data/sweater.jpg')
            .toString('base64'),
        },
      },
    ],
  };

  const image = await client.models.recontextImage({
    model: 'virtual-try-on-preview-08-04',
    source: source,
  });

  console.log('Created output image');
  const outputDir = 'output-folder';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = `${outputDir}/image.png`;
  const imageBytes = image.generatedImages[0].image.imageBytes;
  const buffer = Buffer.from(imageBytes, 'base64');

  fs.writeFileSync(outputPath, buffer);

  return image.generatedImages[0];
}
// Example response:
// Created output image using 1234567 bytes

// [END googlegenaisdk_imggen_virtual_try_on_with_txt_img]

module.exports = {
  virtualTryOn,
};
