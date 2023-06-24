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

async function main(project, location, model = 'text-bison-001') {
  // [START aiplatform_list_tuned_models]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';
  // const model = 'text-bison@001';
  const aiplatform = require('@google-cloud/aiplatform');

  const {ModelServiceClient} = aiplatform.v1;
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiate the service client.
  const modelServiceClient = new ModelServiceClient(clientOptions);

  async function listTunedModels() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;
    const filter = `labels.google-vertex-llm-tuning-base-model-id=${model}`;

    const request = {
      parent,
      filter,
    };

    const [response] = await modelServiceClient.listModels(request);
    console.log('List Tuned Models response');
    for (const model of response) {
      console.log(`\tModel name: ${model.name}`);
      console.log(`\tDisplay name: ${model.displayName}`);
    }
  }
  await listTunedModels();
  // [END aiplatform_list_tuned_models]
}

exports.listTunedModels = main;
