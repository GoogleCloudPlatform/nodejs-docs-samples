// Copyright 2024 Google LLC
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

// [START generativeaionvertexai_function_calling_advanced]
const {GoogleGenAI} = require('@google/genai');

const tools = [
  {
    functionDeclarations: [
      {
        name: 'get_product_sku',
        description: 'Get the available inventory for Google products',
        parameters: {
          type: 'OBJECT',
          properties: {
            productName: {type: 'STRING'},
          },
        },
      },
      {
        name: 'get_store_location',
        description: 'Get the location of the closest store',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: {type: 'STRING'},
          },
        },
      },
    ],
  },
];

const toolConfig = {
  functionCallingConfig: {
    mode: 'ANY',
    allowedFunctionNames: ['get_product_sku'],
  },
};

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function functionCallingAdvanced(
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

  const result = await client.models.generateContent({
    model: model,
    contents: 'Do you have the White Pixel 8 Pro 128GB in stock in the US?',
    config: {
      tools: tools,
      toolConfig: toolConfig,
      temperature: 0.95,
      topP: 1.0,
      maxOutputTokens: 8192,
    },
  });
  console.log(JSON.stringify(result.functionCalls));
}
// [END generativeaionvertexai_function_calling_advanced]

functionCallingAdvanced(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
