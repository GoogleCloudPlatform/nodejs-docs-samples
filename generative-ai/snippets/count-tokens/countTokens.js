// Copyright 2024 Google LLC
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

const {GoogleGenAI} = require('@google/genai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function countTokens(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.5-flash'
) {
  // Initialize the client with your Cloud project and location
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const contents = [
    {role: 'user', parts: [{text: 'How are you doing today?'}]},
  ];

  // Prompt tokens count
  const countTokensResp = await client.models.countTokens({
    model: model,
    contents: contents,
  });
  console.log('Prompt tokens count: ', countTokensResp);

  // Send text to gemini
  const result = await client.models.generateContent({
    model: model,
    contents: contents,
  });

  // Response tokens count
  const usageMetadata = result.usageMetadata;
  console.log('Response tokens count: ', usageMetadata);
}

countTokens(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
