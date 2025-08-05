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

// [START googlegenaisdk_tools_func_def_with_txt]
const {GoogleGenAI, GenerateContentConfig} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';
// todo not working
async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {

  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  function getCurrentWeather({ location }) {
    const weatherMap = {
      'Boston, MA': 'snowing',
      'San Francisco, CA': 'foggy',
      'Seattle, WA': 'raining',
      'Austin, TX': 'hot',
      'Chicago, IL': 'windy',
    };
    return {
      result: weatherMap[location] || 'unknown',
    };
  }


  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'What is the weather like in Boston?',
    config: {
      tools: [{
        functionDeclarations: [getCurrentWeather]
      }],
      temperature: 0,
    },
  });
  console.log(response);

  return response.text;
}
// [END googlegenaisdk_tools_func_def_with_txt]

module.exports = {
  generateContent,
};
