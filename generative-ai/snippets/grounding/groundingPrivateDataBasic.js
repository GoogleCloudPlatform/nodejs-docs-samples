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

// [START generativeaionvertexai_grounding_private_data_basic]
const {
  VertexAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function generateContentWithVertexAISearchGrounding(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.5-flash-001',
  dataStoreId = 'DATASTORE_ID'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  const generativeModelPreview = vertexAI.preview.getGenerativeModel({
    model: model,
    // The following parameters are optional
    // They can also be passed to individual content generation requests
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    generationConfig: {maxOutputTokens: 256},
  });

  const vertexAIRetrievalTool = {
    retrieval: {
      vertexAiSearch: {
        datastore: `projects/${projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}`,
      },
      disableAttribution: false,
    },
  };

  const request = {
    contents: [{role: 'user', parts: [{text: 'Why is the sky blue?'}]}],
    tools: [vertexAIRetrievalTool],
  };

  const result = await generativeModelPreview.generateContent(request);
  const response = result.response;
  const groundingMetadata = response.candidates[0];
  console.log('Response: ', JSON.stringify(response.candidates[0]));
  console.log('GroundingMetadata is: ', JSON.stringify(groundingMetadata));
}
// [END generativeaionvertexai_grounding_private_data_basic]

generateContentWithVertexAISearchGrounding(...process.argv.slice(2)).catch(
  err => {
    console.error(err.message);
    process.exitCode = 1;
  }
);
