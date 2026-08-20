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

// [START googlegenaisdk_imggen_with_txt]
const {GoogleGenAI} = require('@google/genai');
const fs = require('fs');

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
    model: 'gemini-2.5-flash-image',
    contents: 'A dog reading a newspaper',
  });

  const generatedImagePart = response.candidates?.[0]?.content?.parts?.[0];

  console.log(generatedImagePart);
  console.log('Created output image');

  const outputDir = 'output-folder';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  const imageBytes = generatedImagePart?.inlineData?.data;
  if (!imageBytes) {
    throw new Error('No image data returned from the model.');
  }

  const buffer = Buffer.from(imageBytes, 'base64');
  const fileName = `${outputDir}/dog-image.png`;

  fs.writeFileSync(fileName, buffer);

  return response.candidates?.[0]?.content?.parts;
}
// [END googlegenaisdk_imggen_with_txt]

module.exports = {
  generateImage,
};
