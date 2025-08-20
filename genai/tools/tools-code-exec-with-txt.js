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

// [START googlegenaisdk_tools_code_exec_with_txt]
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents:
      'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.',
    config: {
      tools: [{codeExecution: {}}],
      temperature: 0,
    },
  });

  console.debug(response.executableCode);
  console.debug(response.codeExecutionResult);

  return response.codeExecutionResult;
}
// Example response:
// // Code:
// function fibonacci(n) {
//   if (n <= 0) {
//     return 0;
//   } else if (n === 1) {
//     return 1;
//   } else {
//     let a = 0, b = 1;
//     for (let i = 2; i <= n; i++) {
//       [a, b] = [b, a + b];
//     }
//     return b;
//   }
// }
//
// const fib20 = fibonacci(20);
// console.log(`fib20=${fib20}`);
//
// // Outcome:
// // fib20=6765

// [END googlegenaisdk_tools_code_exec_with_txt]

module.exports = {
  generateContent,
};
