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
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function sendMultiModalPromptWithVideo(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.5-flash-001'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  const generativeVisionModel = vertexAI.getGenerativeModel({
    model: model,
  });

  // Pass multimodal prompt
  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              fileUri: 'gs://cloud-samples-data/video/animals.mp4',
              mimeType: 'video/mp4',
            },
          },
          {
            text: 'What is in the video?',
          },
        ],
      },
    ],
  };

  // Create the response
  const response = await generativeVisionModel.generateContent(request);
  // Wait for the response to complete
  const aggregatedResponse = await response.response;
  // Select the text from the response
  const fullTextResponse =
    aggregatedResponse.candidates[0].content.parts[0].text;

  console.log(fullTextResponse);
}
// [END generativeaionvertexai_gemini_single_turn_video]

sendMultiModalPromptWithVideo(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
