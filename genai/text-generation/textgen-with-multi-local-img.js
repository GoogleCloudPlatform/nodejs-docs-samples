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

// [START googlegenaisdk_textgen_with_multi_local_img]
const {GoogleGenAI} = require('@google/genai');
const fs = require('fs');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

function loadImageAsBase64(path) {
  const bytes = fs.readFileSync(path);
  return bytes.toString('base64');
}

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION,
  imagePath1,
  imagePath2
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  // TODO(Developer): Update the below file paths to your images
  const image1 = loadImageAsBase64(imagePath1);
  const image2 = loadImageAsBase64(imagePath2);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Generate a list of all the objects contained in both images.',
          },
          {
            inlineData: {
              data: image1,
              mimeType: 'image/jpeg',
            },
          },
          {
            inlineData: {
              data: image2,
              mimeType: 'image/jpeg',
            },
          },
        ],
      },
    ],
  });

  console.log(response.text);

  return response.text;
}
// Example response:
//  Okay, here's a jingle combining the elements of both sets of images, focusing on ...
//  ...
// [END googlegenaisdk_textgen_with_multi_local_img]

module.exports = {
  generateContent,
};
