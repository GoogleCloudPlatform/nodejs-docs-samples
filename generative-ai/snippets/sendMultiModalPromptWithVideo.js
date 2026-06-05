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

// [START generativeaionvertexai_gemini_single_turn_video]
const {GoogleGenAI} = require('@google/genai');
/**
 * TODO(developer): Update these variables before running the sample.
 */
async function sendMultiModalPromptWithVideo(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.5-flash'
) {
  // Initialize client with your Cloud project and location
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  // Pass multimodal prompt
  const filePart = {
    fileData: {
      fileUri: 'gs://cloud-samples-data/video/animals.mp4',
      mimeType: 'video/mp4',
    },
  };

  const textPart = 'What is in the video?';

  // Create the response
  const response = await client.models.generateContent({
    model: model,
    contents: [filePart, textPart],
  });

  console.log(response.text);
}
// [END generativeaionvertexai_gemini_single_turn_video]

sendMultiModalPromptWithVideo(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
