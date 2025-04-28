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

// [START generativeaionvertexai_gemini_multiturn_chat_nonstreaming]
// [START aiplatform_gemini_multiturn_chat_nonstreaming]
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function createNonStreamingChat(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.0-flash-001'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  // Instantiate the model
  const generativeModel = vertexAI.getGenerativeModel({
    model: model,
  });

  const chat = generativeModel.startChat({});

  const result1 = await chat.sendMessage('Hello');
  const response1 = await result1.response;
  console.log('Chat response 1: ', JSON.stringify(response1));

  const result2 = await chat.sendMessage(
    'Can you tell me a scientific fun fact?'
  );
  const response2 = await result2.response;
  console.log('Chat response 2: ', JSON.stringify(response2));

  const result3 = await chat.sendMessage('How can I learn more about that?');
  const response3 = await result3.response;
  console.log('Chat response 3: ', JSON.stringify(response3));
}
// [END aiplatform_gemini_multiturn_chat_nonstreaming]
// [END generativeaionvertexai_gemini_multiturn_chat_nonstreaming]

createNonStreamingChat(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
