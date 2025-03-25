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
const {
  VertexAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
const PROJECT_ID = process.env.CAIP_PROJECT_ID;
const LOCATION = 'us-central1';
const MODEL = 'gemini-1.5-flash-001';

async function setSafetySettings() {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: PROJECT_ID, location: LOCATION});

  // Instantiate the model
  const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL,
    // The following parameters are optional
    // They can also be passed to individual content generation requests
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });

  const request = {
    contents: [{role: 'user', parts: [{text: 'Tell me something dangerous.'}]}],
  };

  console.log('Prompt:');
  console.log(request.contents[0].parts[0].text);
  console.log('Streaming Response Text:');

  // Create the response stream
  const responseStream = await generativeModel.generateContentStream(request);

  // Log the text response as it streams
  for await (const item of responseStream.stream) {
    if (item.candidates[0].finishReason === 'SAFETY') {
      console.log('This response stream terminated due to safety concerns.');
      break;
    } else {
      process.stdout.write(item.candidates[0].content.parts[0].text);
    }
  }
  console.log('This response stream terminated due to safety concerns.');
}
// [END generativeaionvertexai_gemini_safety_settings]

setSafetySettings().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
