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

// [START generativeaionvertexai_gemini_function_calling_chat]
const {GoogleGenAI} = require('@google/genai');

const tools = [
  {
    functionDeclarations: [
      {
        name: 'get_current_weather',
        description: 'get weather in a given location',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: {type: 'STRING'},
            unit: {type: 'STRING', enum: ['celsius', 'fahrenheit']},
          },
          required: ['location'],
        },
      },
    ],
  },
];

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function functionCallingStreamChat(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.0-flash-001'
) {
  // Initialize client with your Cloud project and location
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  // Create a chat session and pass your function declarations
  const chat = client.chats.create({
    model: model,
    config: {tools: tools},
  });

  // This should include a functionCall response from the model
  const result1 = await chat.sendMessage({
    message: 'What is the weather in Boston?',
  });
  console.log(
    'Function call requested:',
    JSON.stringify(result1.functionCalls, null, 2)
  );

  // Send a follow up message with a FunctionResponse
  const result2 = await chat.sendMessage({
    message: [
      {
        functionResponse: {
          name: 'get_current_weather',
          response: {result: {weather: 'super nice'}},
        },
      },
    ],
  });

  // This should include a text response from the model using the response content
  // provided above
  console.log(result2.text);
}
// [END generativeaionvertexai_gemini_function_calling_chat]

functionCallingStreamChat(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
