// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(projectId, computeRegion, modelId, filePath) {
  // [START automl_translation_predict]
  const automl = require('@google-cloud/automl');
  const fs = require('fs');

  // Create client for prediction service.
  const client = new automl.PredictionServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;
  // const filePath = `local text file path of content to be classified, e.g. "./resources/test.txt"`;
  // const translationAllowFallback = `use Google translation model as fallback, e.g. "False" or "True"`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Read the file content for translation.
  const content = fs.readFileSync(filePath, 'utf8');

  async function predict() {
    // Set the payload by giving the content of the file.
    const payload = {
      textSnippet: {
        content: content,
      },
    };

    const [response] = await client.predict({
      name: modelFullId,
      payload: payload,
    });

    console.log(
      'Translated Content: ',
      response.payload[0].translation.translatedContent.content
    );
  }

  predict();
  // [END automl_translation_predict]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
