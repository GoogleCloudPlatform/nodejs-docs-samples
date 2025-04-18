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

// [START generativeaionvertexai_function_calling_basic]
const {
  VertexAI,
  FunctionDeclarationSchemaType,
} = require('@google-cloud/vertexai');

const functionDeclarations = [
  {
    function_declarations: [
      {
        name: 'get_current_weather',
        description: 'get weather in a given location',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            location: {type: FunctionDeclarationSchemaType.STRING},
            unit: {
              type: FunctionDeclarationSchemaType.STRING,
              enum: ['celsius', 'fahrenheit'],
            },
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
async function functionCallingBasic(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.0-flash-001'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  // Instantiate the model
  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: model,
  });

  const request = {
    contents: [
      {role: 'user', parts: [{text: 'What is the weather in Boston?'}]},
    ],
    tools: functionDeclarations,
  };
  const result = await generativeModel.generateContent(request);
  console.log(JSON.stringify(result.response.candidates[0].content));
}
// [END generativeaionvertexai_function_calling_basic]

functionCallingBasic(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
