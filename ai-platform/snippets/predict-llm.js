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

async function main(endpointId, project, location) {
  // [START aiplatform_predict_llm_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const endpointId = 'YOUR_ENDPOINT_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  const aiplatform = require('@google-cloud/aiplatform');
  const {helpers} = aiplatform;

  // Imports the Google Cloud Model Service Client library
  const {PredictionServiceClient} = aiplatform.v1;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  async function predictTextClassification() {
    // Configure the resources
    const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;

    const instanceObj = {
      prompt:
        'Give me ten interview questions for the role of program manager.',
    };

    const instanceValue = helpers.toValue(instanceObj);
    const instances = [instanceValue];

    const parametersObj = {
      temperature: 0.2,
      maxOutputTokens: 5,
      topP: 0.95,
      topK: 40,
    };
    const parameters = helpers.toValue(parametersObj);

    const request = {
      endpoint,
      instances,
      parameters,
    };

    const [response] = await predictionServiceClient.predict(request);
    console.log('Chat LLM response');
    console.log(`\tDeployed model id : ${response.deployedModelId}\n\n`);

    console.log('Prediction results:');

    for (const predictionResultValue of response.predictions) {
      const predictionResult = helpers.fromValue(predictionResultValue);

      for (const [i, label] of predictionResult.displayNames.entries()) {
        console.log(`\tDisplay name: ${label}`);
        console.log(`\tConfidences: ${predictionResult.confidences[i]}`);
        console.log(`\tIDs: ${predictionResult.ids[i]}\n\n`);
      }
    }
  }
  predictTextClassification();
  // [END aiplatform_predict_llm_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
