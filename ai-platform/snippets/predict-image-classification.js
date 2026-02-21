/*
 * Copyright 2020 Google LLC
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

function main(filename, endpointId, project, location = 'us-central1') {
  // [START aiplatform_predict_image_classification_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const filename = "YOUR_PREDICTION_FILE_NAME";
  // const endpointId = "YOUR_ENDPOINT_ID";
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  const aiplatform = require('@google-cloud/aiplatform');
  const {instance, params, prediction} =
    aiplatform.protos.google.cloud.aiplatform.v1.schema.predict;

  // Imports the Google Cloud Prediction Service Client library
  const {PredictionServiceClient} = aiplatform.v1;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const predictionServiceClient = new PredictionServiceClient(clientOptions);

  async function predictImageClassification() {
    // Configure the endpoint resource
    const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;

    const parametersObj = new params.ImageClassificationPredictionParams({
      confidenceThreshold: 0.5,
      maxPredictions: 5,
    });
    const parameters = parametersObj.toValue();

    const fs = require('node:fs');
    const image = fs.readFileSync(filename, 'base64');
    const instanceObj = new instance.ImageClassificationPredictionInstance({
      content: image,
    });
    const instanceValue = instanceObj.toValue();

    const instances = [instanceValue];
    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);

    console.log('Predict image classification response');
    console.log(`\tDeployed model id : ${response.deployedModelId}`);
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const predictionValue of predictions) {
      const predictionResultObj =
        prediction.ClassificationPredictionResult.fromValue(predictionValue);
      for (const [i, label] of predictionResultObj.displayNames.entries()) {
        console.log(`\tDisplay name: ${label}`);
        console.log(`\tConfidences: ${predictionResultObj.confidences[i]}`);
        console.log(`\tIDs: ${predictionResultObj.ids[i]}\n\n`);
      }
    }
  }
  predictImageClassification();
  // [END aiplatform_predict_image_classification_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
