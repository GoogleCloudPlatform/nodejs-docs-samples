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
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function createStreamMultipartContent(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.5-flash-001',
  image = 'gs://generativeai-downloads/images/scones.jpg',
  mimeType = 'image/jpeg'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  // Instantiate the model
  const generativeVisionModel = vertexAI.getGenerativeModel({
    model: model,
  });

  // For images, the SDK supports both Google Cloud Storage URI and base64 strings
  const filePart = {
    fileData: {
      fileUri: image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: 'what is shown in this image?',
  };

  const request = {
    contents: [{role: 'user', parts: [filePart, textPart]}],
  };

  console.log('Prompt Text:');
  console.log(request.contents[0].parts[1].text);
  console.log('Streaming Response Text:');

  // Create the response stream
  const responseStream =
    await generativeVisionModel.generateContentStream(request);

  // Log the text response as it streams
  for await (const item of responseStream.stream) {
    process.stdout.write(item.candidates[0].content.parts[0].text);
  }
}
// [END aiplatform_gemini_get_started]

createStreamMultipartContent(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
