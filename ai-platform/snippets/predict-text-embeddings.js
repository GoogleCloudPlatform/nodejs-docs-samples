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

// [START aiplatform_sdk_embedding]
// [START generativeaionvertexai_sdk_embedding]
async function main(
  project,
  model = 'gemini-embedding-001',
  texts = 'banana bread?;banana muffins?',
  task = 'QUESTION_ANSWERING',
  dimensionality = 0,
  apiEndpoint = 'us-central1-aiplatform.googleapis.com'
) {
  const aiplatform = require('@google-cloud/aiplatform');
  const {PredictionServiceClient} = aiplatform.v1;
  const {helpers} = aiplatform; // helps construct protobuf.Value objects.
  const clientOptions = {apiEndpoint: apiEndpoint};
  const location = 'us-central1';
  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;

  async function callPredict() {
    const instances = texts
      .split(';')
      .map(e => helpers.toValue({content: e, task_type: task}));
    
    const client = new PredictionServiceClient(clientOptions);
    const parameters = helpers.toValue(
      dimensionality > 0 ? {outputDimensionality: parseInt(dimensionality)} : {}
    );
    const allEmbeddings = []
    // gemini-embedding-001 takes one input at a time.
    for (const instance of instances) {
      const request = {endpoint, instances: [instance], parameters};
      const [response] = await client.predict(request);
      const predictions = response.predictions;

      const embeddings = predictions.map(p => {
        const embeddingsProto = p.structValue.fields.embeddings;
        const valuesProto = embeddingsProto.structValue.fields.values;
        return valuesProto.listValue.values.map(v => v.numberValue);
      });

      allEmbeddings.push(embeddings[0])
    }


    console.log('Got embeddings: \n' + JSON.stringify(allEmbeddings));
  }

  callPredict();
}
// [END aiplatform_sdk_embedding]
// [END generativeaionvertexai_sdk_embedding]

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
