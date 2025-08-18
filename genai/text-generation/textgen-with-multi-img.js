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

// [START googlegenaisdk_textgen_with_multi_img]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const image1 = {
    fileData: {
      fileUri: 'gs://cloud-samples-data/generative-ai/image/scones.jpg',
      mimeType: 'image/jpeg',
    },
  };

  const image2 = {
    fileData: {
      fileUri: 'gs://cloud-samples-data/generative-ai/image/fruit.png',
      mimeType: 'image/png',
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      image1,
      image2,
      'Generate a list of all the objects contained in both images.',
    ],
  });

  console.log(response.text);

  return response.text;
}
// [END googlegenaisdk_textgen_with_multi_img]

module.exports = {
  generateContent,
};
