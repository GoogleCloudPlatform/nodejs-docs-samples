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

async function main(
  modelId,
  evaluationId,
  sliceId,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_get_model_evaluation_slice_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample
   * (not necessary if passing values as arguments). To obtain evaluationId,
   * instantiate the client and run the following the commands.
   */
  // const parentName = `projects/${project}/locations/${location}/models/${modelId}`;
  // const evalRequest = {
  //   parent: parentName
  // };
  // const [evalResponse] = await modelServiceClient.listModelEvaluations(evalRequest);
  // console.log(evalResponse);

  // const modelId = 'YOUR_MODEL_ID';
  // const evaluationId = 'YOUR_EVALUATION_ID';
  // const sliceId = 'YOUR_SLICE_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Model Service client library
  const {ModelServiceClient} = require('@google-cloud/aiplatform');
  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };
  // Specifies the location of the api endpoint
  const modelServiceClient = new ModelServiceClient(clientOptions);

  async function getModelEvaluationSlice() {
    // Configure the parent resource
    const name = `projects/${project}/locations/${location}/models/${modelId}/evaluations/${evaluationId}/slices/${sliceId}`;
    const request = {
      name,
    };

    // Get and print out a list of all the endpoints for this resource
    const [response] =
      await modelServiceClient.getModelEvaluationSlice(request);

    console.log('Get model evaluation slice');
    console.log(`\tName : ${response.name}`);
    console.log(`\tMetrics_Schema_Uri : ${response.metricsSchemaUri}`);
    console.log(`\tMetrics : ${JSON.stringify(response.metrics)}`);
    console.log(`\tCreate time : ${JSON.stringify(response.createTime)}`);

    console.log('Slice');
    const slice = response.slice;
    console.log(`\tDimension :${slice.dimension}`);
    console.log(`\tValue :${slice.value}`);
  }
  getModelEvaluationSlice();
  // [END aiplatform_get_model_evaluation_slice_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
