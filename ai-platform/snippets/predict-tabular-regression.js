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
  // [START aiplatform_predict_tabular_regression_sample]
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

  async function predictTablesRegression() {
    // Configure the endpoint resource
    const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;
    const parameters = helpers.toValue({});

    // TODO (erschmid): Make this less painful
    const instance = helpers.toValue({
      BOOLEAN_2unique_NULLABLE: false,
      DATETIME_1unique_NULLABLE: '2019-01-01 00:00:00',
      DATE_1unique_NULLABLE: '2019-01-01',
      FLOAT_5000unique_NULLABLE: 1611,
      FLOAT_5000unique_REPEATED: [2320, 1192],
      INTEGER_5000unique_NULLABLE: '8',
      NUMERIC_5000unique_NULLABLE: 16,
      STRING_5000unique_NULLABLE: 'str-2',
      STRUCT_NULLABLE: {
        BOOLEAN_2unique_NULLABLE: false,
        DATE_1unique_NULLABLE: '2019-01-01',
        DATETIME_1unique_NULLABLE: '2019-01-01 00:00:00',
        FLOAT_5000unique_NULLABLE: 1308,
        FLOAT_5000unique_REPEATED: [2323, 1178],
        FLOAT_5000unique_REQUIRED: 3089,
        INTEGER_5000unique_NULLABLE: '1777',
        NUMERIC_5000unique_NULLABLE: 3323,
        TIME_1unique_NULLABLE: '23:59:59.999999',
        STRING_5000unique_NULLABLE: 'str-49',
        TIMESTAMP_1unique_NULLABLE: '1546387199999999',
      },
      TIMESTAMP_1unique_NULLABLE: '1546387199999999',
      TIME_1unique_NULLABLE: '23:59:59.999999',
    });

    const instances = [instance];
    const request = {
      endpoint,
      instances,
      parameters,
    };

    // Predict request
    const [response] = await predictionServiceClient.predict(request);

    console.log('Predict tabular regression response');
    console.log(`\tDeployed model id : ${response.deployedModelId}`);
    const predictions = response.predictions;
    console.log('\tPredictions :');
    for (const predictionResultVal of predictions) {
      const predictionResultObj =
        prediction.TabularRegressionPredictionResult.fromValue(
          predictionResultVal
        );
      console.log(`\tUpper bound: ${predictionResultObj.upper_bound}`);
      console.log(`\tLower bound: ${predictionResultObj.lower_bound}`);
      console.log(`\tLower bound: ${predictionResultObj.value}`);
    }
  }
  predictTablesRegression();
  // [END aiplatform_predict_tabular_regression_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
