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
const {
  VertexAI,
  FunctionDeclarationSchemaType,
} = require('@google-cloud/vertexai');

const functionDeclarations = [
  {
    function_declarations: [
      {
        name: 'get_product_sku',
        description:
          'Get the available inventory for a Google products, e.g: Pixel phones, Pixel Watches, Google Home etc',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            productName: {type: FunctionDeclarationSchemaType.STRING},
          },
        },
      },
      {
        name: 'get_store_location',
        description: 'Get the location of the closest store',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            location: {type: FunctionDeclarationSchemaType.STRING},
          },
        },
      },
    ],
  },
];

const toolConfig = {
  function_calling_config: {
    mode: 'ANY',
    allowed_function_names: ['get_product_sku'],
  },
};

const generationConfig = {
  temperature: 0.95,
  topP: 1.0,
  maxOutputTokens: 8192,
};

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function functionCallingAdvanced(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.5-flash-001'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  // Instantiate the model
  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: model,
  });

  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {text: 'Do you have the White Pixel 8 Pro 128GB in stock in the US?'},
        ],
      },
    ],
    tools: functionDeclarations,
    tool_config: toolConfig,
    generation_config: generationConfig,
  };
  const result = await generativeModel.generateContent(request);
  console.log(JSON.stringify(result.response.candidates[0].content));
}
// [END generativeaionvertexai_function_calling_advanced]

functionCallingAdvanced(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
