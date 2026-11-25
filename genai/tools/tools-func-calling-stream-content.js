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

// [START aiplatform_genai_function_calling_stream_content]
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

const functionResponseParts = [
  {
    functionResponse: {
      name: 'get_current_weather',
      response: {weather: 'super nice'},
    },
  },
];

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function functionCallingStreamContent(
  projectId = 'PROJECT_ID',
  location = 'global',
  model = 'gemini-3.8-flash'
) {
  // Initialize client with your Cloud project and location
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const userTurn = {
    role: 'user',
    parts: [{text: 'What is the weather in Boston?'}],
  };

  // First turn: let the model request the function call so its response
  // preserves the thought signature required by Gemini 3.8.
  const firstResponse = await client.models.generateContent({
    model: model,
    contents: [userTurn],
    config: {tools: tools},
  });

  const request = [
    userTurn,
    firstResponse.candidates[0].content,
    {role: 'user', parts: functionResponseParts},
  ];

  const streamingResp = await client.models.generateContentStream({
    model: model,
    contents: request,
    config: {tools: tools},
  });

  let completeResponseText = '';
  for await (const chunk of streamingResp) {
    if (chunk.text) {
      completeResponseText += chunk.text;
    }
  }
  console.log(completeResponseText);
}
// [END aiplatform_genai_function_calling_stream_content]

functionCallingStreamContent(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
