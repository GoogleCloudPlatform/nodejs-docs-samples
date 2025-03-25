/*
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main() {
  // [START aiplatform_sdk_code_completion_test_function]
  /**
   * TODO(developer): Update these variables before running the sample.
   */
  const PROJECT_ID = process.env.CAIP_PROJECT_ID;
  const LOCATION = 'us-central1';
  const PUBLISHER = 'google';
  const MODEL = 'code-gecko@001';
  const aiplatform = require('@google-cloud/aiplatform');

  // Imports the Google Cloud Prediction service client
  const {PredictionServiceClient} = aiplatform.v1;

  // Import the helper module for converting arbitrary protobuf.Value objects.
  const {helpers} = aiplatform;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  async function callPredict() {
    // Configure the parent resource
    const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/${PUBLISHER}/models/${MODEL}`;

    const prompt = {
      prefix:
        'def reverse_string(s): \
            return s[::-1] \
         def test_empty_input_string()',
    };
    const instanceValue = helpers.toValue(prompt);
    const instances = [instanceValue];

    const parameter = {
      temperature: 0.2,
      maxOutputTokens: 64,
    };
    const parameters = helpers.toValue(parameter);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);
    console.log('Get code completion response');
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const prediction of predictions) {
      console.log(`\t\tPrediction : ${JSON.stringify(prediction)}`);
    }
  }

  callPredict();
  // [END aiplatform_sdk_code_completion_test_function]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();
