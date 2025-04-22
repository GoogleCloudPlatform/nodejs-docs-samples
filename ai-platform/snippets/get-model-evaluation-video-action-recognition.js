/*
 * Copyright 2021 Google LLC
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

async function main(modelId, evaluationId, project, location = 'us-central1') {
  // [START aiplatform_get_model_evaluation_video_action_recognition_sample]
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
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Model Service Client library
  const {ModelServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const modelServiceClient = new ModelServiceClient(clientOptions);

  async function getModelEvaluationVideoActionRecognition() {
    // Configure the parent resources
    const name = modelServiceClient.modelEvaluationPath(
      project,
      location,
      modelId,
      evaluationId
    );
    const request = {
      name,
    };

    // Create get model evaluation request
    const [response] = await modelServiceClient.getModelEvaluation(request);

    console.log('Get model evaluation video action recognition response');
    console.log(`\tName : ${response.name}`);
    console.log(`\tMetrics schema uri : ${response.metricsSchemaUri}`);
    console.log(`\tMetrics : ${JSON.stringify(response.metrics)}`);
    console.log(`\tCreate time : ${JSON.stringify(response.createTime)}`);
    console.log(`\tSlice dimensions : ${response.sliceDimensions}`);
  }
  getModelEvaluationVideoActionRecognition();
  // [END aiplatform_get_model_evaluation_video_action_recognition_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
