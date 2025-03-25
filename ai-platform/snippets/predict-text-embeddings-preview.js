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
  // [START generativeaionvertexai_sdk_embedding]

  // TODO(developer): Update the following for your own use case.
  const project = 'long-door-651';
  const model = 'text-embedding-005';
  const location = 'us-central1';
  // Calculate the embedding for code blocks. Using 'RETRIEVAL_DOCUMENT' for corpus.
  // Specify the task type as 'CODE_RETRIEVAL_QUERY' for query, e.g. 'Retrieve a function that adds two numbers'.
  const texts =
    'def func(a, b): return a + b;def func(a, b): return a - b;def func(a, b): return (a ** 2 + b ** 2) ** 0.5';
  const task = 'RETRIEVAL_DOCUMENT';
  const dimensionality = 3;
  const apiEndpoint = 'us-central1-aiplatform.googleapis.com';

  const aiplatform = require('@google-cloud/aiplatform');
  const {PredictionServiceClient} = aiplatform.v1;
  const {helpers} = aiplatform; // helps construct protobuf.Value objects.
  const clientOptions = {apiEndpoint: apiEndpoint};
  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
  const parameters = helpers.toValue({
    outputDimensionality: parseInt(dimensionality),
  });

  async function callPredict() {
    const instances = texts
      .split(';')
      .map(e => helpers.toValue({content: e, task_type: task}));
    const request = {endpoint, instances, parameters};
    const client = new PredictionServiceClient(clientOptions);
    const [response] = await client.predict(request);
    const predictions = response.predictions;
    const embeddings = predictions.map(p => {
      const embeddingsProto = p.structValue.fields.embeddings;
      const valuesProto = embeddingsProto.structValue.fields.values;
      return valuesProto.listValue.values.map(v => v.numberValue);
    });
    console.log('Got embeddings: \n' + JSON.stringify(embeddings));
  }
  await callPredict();
  // [END generativeaionvertexai_sdk_embedding]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
