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

async function main(endpointId, project, location = 'us-central1') {
  // [START aiplatform_predict_tabular_classification_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const endpointId = 'YOUR_ENDPOINT_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  const aiplatform = require('@google-cloud/aiplatform');
  const {prediction} =
    aiplatform.protos.google.cloud.aiplatform.v1.schema.predict;

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

  async function predictTablesClassification() {
    // Configure the endpoint resource
    const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;
    const parameters = helpers.toValue({});

    const instance = helpers.toValue({
      petal_length: '1.4',
      petal_width: '1.3',
      sepal_length: '5.1',
      sepal_width: '2.8',
    });

    const instances = [instance];
    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);

    console.log('Predict tabular classification response');
    console.log(`\tDeployed model id : ${response.deployedModelId}\n`);
    const predictions = response.predictions;
    console.log('Predictions :');
    for (const predictionResultVal of predictions) {
      const predictionResultObj =
        prediction.TabularClassificationPredictionResult.fromValue(
          predictionResultVal
        );
      for (const [i, class_] of predictionResultObj.classes.entries()) {
        console.log(`\tClass: ${class_}`);
        console.log(`\tScore: ${predictionResultObj.scores[i]}\n\n`);
      }
    }
  }
  predictTablesClassification();
  // [END aiplatform_predict_tabular_classification_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
