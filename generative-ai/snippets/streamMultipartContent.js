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

// [START aiplatform_gemini_get_started]
const {GoogleGenAI} = require('@google/genai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function createStreamMultipartContent(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.5-flash',
  image = 'gs://generativeai-downloads/images/scones.jpg',
  mimeType = 'image/jpeg'
) {
  // Initialize client with your Cloud project and location
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const promptText = 'what is shown in this image?';

  console.log('Prompt Text:');
  console.log(promptText);
  console.log('Streaming Response Text:');

  const responseStream = await client.models.generateContentStream({
    model: model,
    contents: [
      {
        fileData: {
          fileUri: image,
          mimeType: mimeType,
        },
      },
      promptText,
    ],
  });

  // Log the text response as it streams
  for await (const chunk of responseStream) {
    if (chunk.text) {
      process.stdout.write(chunk.text);
    }
  }
}
// [END aiplatform_gemini_get_started]

createStreamMultipartContent(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
