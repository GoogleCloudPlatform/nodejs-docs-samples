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

// [START googlegenaisdk_thinking_budget_with_txt]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateWithThoughts(
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
    contents: 'solve x^2 + 4x + 4 = 0',
    config: {
      thinkingConfig: {
        thinkingBudget: 1024,
      },
    },
  });

  console.log(response.text);
  // Example response:
  //  To solve the equation $x^2 + 4x + 4 = 0$, you can use several methods:
  //  **Method 1: Factoring**
  //  1.  Look for two numbers that multiply to the constant term (4) and add up to the coefficient of the $x$ term (4).
  //  2.  The numbers are 2 and 2 ($2 \times 2 = 4$ and $2 + 2 = 4$).
  //  ...
  //  ...
  //  All three methods yield the same solution. This quadratic equation has exactly one distinct solution (a repeated root).
  //  The solution is **x = -2**.

  // Token count for `Thinking`
  console.log(response.usageMetadata.thoughtsTokenCount);
  // Example response:
  //  886

  // Total token count
  console.log(response.usageMetadata.totalTokenCount);
  // Example response:
  //  1525
  return response.text;
}
// [END googlegenaisdk_thinking_budget_with_txt]

module.exports = {
  generateWithThoughts,
};
