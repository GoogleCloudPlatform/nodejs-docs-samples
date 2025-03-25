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

'use strict';

// [START generativeaionvertexai_gemma2_predict_gpu]
async function gemma2PredictGpu(predictionServiceClient) {
  // Imports the Google Cloud Prediction Service Client library
  const {
    // TODO(developer): Uncomment PredictionServiceClient before running the sample.
    // PredictionServiceClient,
    helpers,
  } = require('@google-cloud/aiplatform');
  /**
   * TODO(developer): Update these variables before running the sample.
   */
  const projectId = 'your-project-id';
  const endpointRegion = 'your-vertex-endpoint-region';
  const endpointId = 'your-vertex-endpoint-id';

  // Default configuration
  const config = {maxOutputTokens: 1024, temperature: 0.9, topP: 1.0, topK: 1};
  // Prompt used in the prediction
  const prompt = 'Why is the sky blue?';

  // Encapsulate the prompt in a correct format for GPUs
  // Example format: [{inputs: 'Why is the sky blue?', parameters: {temperature: 0.9}}]
  const input = {
    inputs: prompt,
    parameters: config,
  };

  // Convert input message to a list of GAPIC instances for model input
  const instances = [helpers.toValue(input)];

  // TODO(developer): Uncomment apiEndpoint and predictionServiceClient before running the sample.
  // const apiEndpoint = `${endpointRegion}-aiplatform.googleapis.com`;

  // Create a client
  // predictionServiceClient = new PredictionServiceClient({apiEndpoint});

  // Call the Gemma2 endpoint
  const gemma2Endpoint = `projects/${projectId}/locations/${endpointRegion}/endpoints/${endpointId}`;

  const [response] = await predictionServiceClient.predict({
    endpoint: gemma2Endpoint,
    instances,
  });

  const predictions = response.predictions;
  const text = predictions[0].stringValue;

  console.log('Predictions:', text);
  return text;
}

module.exports = gemma2PredictGpu;

// TODO(developer): Uncomment below lines before running the sample.
// gemma2PredictGpu(...process.argv.slice(2)).catch(err => {
//   console.error(err.message);
//   process.exitCode = 1;
// });
// [END generativeaionvertexai_gemma2_predict_gpu]
