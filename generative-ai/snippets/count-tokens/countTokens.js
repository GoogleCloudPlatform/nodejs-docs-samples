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

// [START generativeaionvertexai_gemini_token_count]
// [START aiplatform_gemini_token_count]
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function countTokens(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.0-pro-002'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: projectId, location: location});

  // Instantiate the model
  const generativeModel = vertexAI.getGenerativeModel({
    model: model,
  });

  const req = {
    contents: [{role: 'user', parts: [{text: 'How are you doing today?'}]}],
  };

  const countTokensResp = await generativeModel.countTokens(req);
  console.log('count tokens response: ', countTokensResp);
}
// [END aiplatform_gemini_token_count]
// [END generativeaionvertexai_gemini_token_count]

countTokens(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
