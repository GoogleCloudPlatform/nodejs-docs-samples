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

// [START googlegenaisdk_tools-google-maps-coordinates-with-txt]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });


  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Where can I get the best espresso near me?',
    config: {
      tools: [
        {
          googleMaps: {},
        },
      ],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
          languageCode: 'en_US',
        },
      },
    },
  });

  const output = [];

  console.log('\n--- Model Output ---');
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts || []) {
      if (part.text) {
        console.log(part.text);
        output.push(part.text);
      }
    }
  }

  return output;
}
// [END googlegenaisdk_tools-google-maps-coordinates-with-txt]

module.exports = {
  generateContent,
};
