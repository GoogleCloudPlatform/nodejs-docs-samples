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

// [START googlegenaisdk_safety_with_txt]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateWithSafetySettings(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const systemInstruction = 'Be as mean as possible.';

  const prompt =
    'Write a list of 5 disrespectful things that I might say to the universe after stubbing my toe in the dark.';

  const safetySettings = [
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ];

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      safetySettings: safetySettings,
    },
  });

  console.log(response.text);
  console.log(response.candidates[0].finishMessage);

  for (const each of response.candidates[0].safetyRatings) {
    console.log('\nCategory:', String(each.category));
    console.log('Is Blocked:', each.blocked);
    console.log('Probability:', each.probability);
    console.log('Probability Score:', each.probabilityScore);
    console.log('Severity:', each.severity);
    console.log('Severity Score:', each.severityScore);
  }

  // Example response:
  //
  //     Category:  HarmCategory.HARM_CATEGORY_HATE_SPEECH
  //     Is Blocked: False
  //     Probability:  HarmProbability.NEGLIGIBLE
  //     Probability Score:  2.547714e-05
  //     Severity: HarmSeverity.HARM_SEVERITY_NEGLIGIBLE
  //     Severity Score: None
  //
  //     Category:  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT
  //     Is Blocked: False
  //     Probability:  HarmProbability.NEGLIGIBLE
  //     Probability Score:  3.6103818e-06
  //     Severity: HarmSeverity.HARM_SEVERITY_NEGLIGIBLE
  //     Severity Score: None
  //
  //     Category:  HarmCategory.HARM_CATEGORY_HARASSMENT
  //     Is Blocked: True
  //     Probability:  HarmProbability.MEDIUM
  //     Probability Score:  0.71599233
  //     Severity: HarmSeverity.HARM_SEVERITY_MEDIUM
  //     Severity Score: 0.30782545
  //
  //     Category:  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT
  //     Is Blocked: False
  //     Probability:  HarmProbability.NEGLIGIBLE
  //     Probability Score:  1.5624657e-05
  //     Severity: HarmSeverity.HARM_SEVERITY_NEGLIGIBLE
  //     Severity Score: None

  return response;
}

// [END googlegenaisdk_safety_with_txt]

module.exports = {
  generateWithSafetySettings,
};
