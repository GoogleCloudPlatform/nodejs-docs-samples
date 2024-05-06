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

// [START generativeaionvertexai_sdk_embedding]
async function main(
    project, model = 'text-embedding-004',
    texts = 'banana bread?;banana muffins?', task = 'QUESTION_ANSWERING',
    outputDimensionality = 0,
    apiEndpoint = 'us-central1-aiplatform.googleapis.com') {
  const aiplatform = require('@google-cloud/aiplatform');
  const {PredictionServiceClient} = aiplatform.v1;
  const {helpers} = aiplatform;  // helps construct protobuf.Value objects.
  const clientOptions = {apiEndpoint: apiEndpoint};
  const match = apiEndpoint.match(/(?<Location>\w+-\w+)/);
  const location = match ? match.groups.Location : 'us-centra11';
  const endpoint = `projects/${project}/locations/${
      location}/publishers/google/models/${model}`;
  const parameters = outputDimensionality > 0 ?
      helpers.toValue(outputDimensionality) :
      helpers.toValue(256);

  async function callPredict() {
    const instances = texts.split(';').map(
        e => helpers.toValue({content: e, taskType: task}));
    const request = {endpoint, instances, parameters};
    const client = new PredictionServiceClient(clientOptions);
    const [response] = await client.predict(request);
    console.log('Got predict response');
    const predictions = response.predictions;
    for (const prediction of predictions) {
      const embeddings = prediction.structValue.fields.embeddings;
      const values = embeddings.structValue.fields.values.listValue.values;
      console.log('Got prediction: ' + JSON.stringify(values));
    }
  }

  callPredict();
}
// [END generativeaionvertexai_sdk_embedding]

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
main(...process.argv.slice(2));