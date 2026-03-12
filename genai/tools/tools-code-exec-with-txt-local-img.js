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

// [START googlegenaisdk_tools_exec_with_txt_local_img]
const fs = require('fs').promises;
const path = require('path');

const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateAndExecuteMultimodalCode(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const imagePath = path.join(
    __dirname,
    'test-data/640px-Monty_open_door.svg.png'
  );
  const imageBuffer = await fs.readFile(imagePath);
  const imageBase64 = imageBuffer.toString('base64');

  const prompt = `
    Run a simulation of the Monty Hall Problem with 1,000 trials.
    Here's how this works as a reminder. In the Monty Hall Problem, you're on a game
    show with three doors. Behind one is a car, and behind the others are goats. You
    pick a door. The host, who knows what's behind the doors, opens a different door
    to reveal a goat. Should you switch to the remaining unopened door?
    The answer has always been a little difficult for me to understand when people
    solve it with math - so please run a simulation with Python to show me what the
    best strategy is.
    Thank you!
    `;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: imageBase64,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      tools: [{codeExecution: {}}],
      temperature: 0,
    },
  });

  console.debug(response.executableCode);
  console.debug(response.codeExecutionResult);

  // Example response:
  //    Win percentage when switching: 65.50%
  //    Win percentage when not switching: 34.50%

  return response.codeExecutionResult;
}

// [END googlegenaisdk_tools_exec_with_txt_local_img]

module.exports = {
  generateAndExecuteMultimodalCode,
};
