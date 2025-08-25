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

// [START googlegenaisdk_textgen_config_with_txt]
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

  const config = {
    temperature: 0,
    candidateCount: 1,
    responseMimeType: 'application/json',
    topP: 0.95,
    topK: 20,
    seed: 5,
    maxOutputTokens: 500,
    stopSequences: ['STOP!'],
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Why is the sky blue?',
    config: config,
  });

  console.log(response.text);

  return response.text;
}
// Example response:
// {
//   "explanation": "The sky appears blue due to a phenomenon called Rayleigh scattering. When ...
// }
// [END googlegenaisdk_textgen_config_with_txt]

module.exports = {
  generateContent,
};
