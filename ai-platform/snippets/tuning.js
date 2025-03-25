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

async function main(
  project,
  pipelineJobId,
  modelDisplayName,
  gcsOutputDirectory,
  location = 'europe-west4',
  datasetUri = 'gs://cloud-samples-data/ai-platform/generative_ai/headline_classification.jsonl',
  trainSteps = 300
) {
  // [START aiplatform_model_tuning]
  // [START generativeaionvertexai_model_tuning]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  const aiplatform = require('@google-cloud/aiplatform');
  const {PipelineServiceClient} = aiplatform.v1;

  // Import the helper module for converting arbitrary protobuf.Value objects.
  const {helpers} = aiplatform;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'europe-west4-aiplatform.googleapis.com',
  };
  const model = 'text-bison@001';

  const pipelineClient = new PipelineServiceClient(clientOptions);

  async function tuneLLM() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;

    const parameters = {
      train_steps: helpers.toValue(trainSteps),
      project: helpers.toValue(project),
      location: helpers.toValue('us-central1'),
      dataset_uri: helpers.toValue(datasetUri),
      large_model_reference: helpers.toValue(model),
      model_display_name: helpers.toValue(modelDisplayName),
      accelerator_type: helpers.toValue('GPU'), // Optional: GPU or TPU
    };

    const runtimeConfig = {
      gcsOutputDirectory,
      parameterValues: parameters,
    };

    const pipelineJob = {
      templateUri:
        'https://us-kfp.pkg.dev/ml-pipeline/large-language-model-pipelines/tune-large-model/v2.0.0',
      displayName: 'my-tuning-job',
      runtimeConfig,
    };

    const createPipelineRequest = {
      parent,
      pipelineJob,
      pipelineJobId,
    };
    await new Promise((resolve, reject) => {
      pipelineClient.createPipelineJob(createPipelineRequest).then(
        response => resolve(response),
        e => reject(e)
      );
    }).then(response => {
      const [result] = response;
      console.log('Tuning pipeline job:');
      console.log(`\tName: ${result.name}`);
      console.log(
        `\tCreate time: ${new Date(1970, 0, 1)
          .setSeconds(result.createTime.seconds)
          .toLocaleString()}`
      );
      console.log(`\tStatus: ${result.status}`);
    });
  }

  await tuneLLM();
  // [END aiplatform_model_tuning]
  // [END generativeaionvertexai_model_tuning]
}

exports.tuneModel = main;
