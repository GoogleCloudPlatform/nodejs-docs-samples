// Copyright 2023 Google LLC
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

// [START generativeaionvertexai_gemini_safety_settings]
const {GoogleGenAI} = require('@google/genai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
const PROJECT_ID = process.env.CAIP_PROJECT_ID;
const LOCATION = 'us-central1';
const MODEL = 'gemini-2.5-flash';

async function setSafetySettings() {
  // Initialize client with your Cloud project and location
  const client = new GoogleGenAI({
    vertexai: true,
    project: PROJECT_ID,
    location: LOCATION,
  });

  const prompt = 'Tell me something dangerous.';

  console.log('Prompt:');
  console.log(prompt);
  console.log('Streaming Response Text:');

  // Create the response stream
  const responseStream = await client.models.generateContentStream({
    model: MODEL,
    contents: prompt,
    config: {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
      ],
    },
  });

  // Log the text response as it streams
  for await (const chunk of responseStream) {
    const candidate = chunk.candidates?.[0];

    if (candidate?.finishReason === 'SAFETY') {
      console.log('\nThis response stream terminated due to safety concerns.');
      return;
    }

    if (chunk.text) {
      process.stdout.write(chunk.text);
    }
  }
  console.log('This response stream terminated due to safety concerns.');
}
// [END generativeaionvertexai_gemini_safety_settings]

setSafetySettings().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
