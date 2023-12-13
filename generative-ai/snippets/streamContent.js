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

const {VertexAI} = require('@google-cloud/vertexai');

async function createStreamContent(
  projectId = 'PROJECT_ID',
  location = 'LOCATION_ID',
  model = 'MODEL'
) {
  // [START aiplatform_gemini_function_calling]

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'your-project-id';
  // const location = 'us-central1';

  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  // Instantiate the model
  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: model,
  });

  const request = {
    contents: [{role: 'user', parts: [{text: 'What is Node.js?'}]}],
  };

  console.log('Prompt:');
  console.log(request.contents[0].parts[0].text);
  console.log('Streaming Response Text:');

  // Create the response stream
  const responseStream = await generativeModel.generateContentStream(request);

  // Log the text response as it streams
  for await (const item of responseStream.stream) {
    process.stdout.write(item.candidates[0].content.parts[0].text);
  }

  // [END aiplatform_gemini_function_calling]
}

createStreamContent(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
