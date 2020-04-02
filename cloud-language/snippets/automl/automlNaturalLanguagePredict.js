// Copyright 2018 Google LLC
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

/**
 * This application demonstrates how to perform basic operations on dataset
 * with the Google AutoML Natural Language API.
 *
 * For more information, see the documentation at
 * https://cloud.google.com/natural-language/automl/docs/
 */

`use strict`;

async function predict(projectId, computeRegion, modelId, filePath) {
  // [START automl_language_predict]
  const automl = require('@google-cloud/automl');
  const fs = require('fs');

  // Create client for prediction service.
  const client = new automl.v1beta1.PredictionServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;
  // const filePath = `local text file path of content to be classified, e.g. "./resources/test.txt"`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Read the file content for prediction.
  const snippet = fs.readFileSync(filePath, 'utf8');

  // Set the payload by giving the content and type of the file.
  const payload = {
    textSnippet: {
      content: snippet,
      mimeType: 'text/plain',
    },
  };

  // Params is additional domain-specific parameters.
  // Currently there is no additional parameters supported.
  const [response] = await client.predict({
    name: modelFullId,
    payload: payload,
    params: {},
  });
  console.log('Prediction results:');
  response[0].payload.forEach(result => {
    console.log(`Predicted class name: ${result.displayName}`);
    console.log(`Predicted class score: ${result.classification.score}`);
  });
  // [END automl_language_predict]
}

require('yargs')
  .demand(1)
  .options({
    computeRegion: {
      alias: 'c',
      type: 'string',
      default: process.env.REGION_NAME,
      requiresArg: true,
      description: 'region name e.g. "us-central1"',
    },
    filePath: {
      alias: 'f',
      default: './resources/test.txt',
      type: 'string',
      requiresArg: true,
      description: 'local text file path of the content to be classified',
    },
    modelId: {
      alias: 'i',
      type: 'string',
      requiresArg: true,
      description: 'Id of the model which will be used for text classification',
    },
    projectId: {
      alias: 'z',
      type: 'number',
      default: process.env.GCLOUD_PROJECT,
      requiresArg: true,
      description: 'The GCLOUD_PROJECT string, e.g. "my-gcloud-project"',
    },
    scoreThreshold: {
      alias: 's',
      type: 'string',
      default: '0.5',
      requiresArg: true,
      description:
        'A value from 0.0 to 1.0.  When the model makes predictions for an image it will' +
        'only produce results that have at least this confidence score threshold.  Default is .5',
    },
  })
  .command('predict', 'classify the content', {}, opts =>
    predict(
      opts.projectId,
      opts.computeRegion,
      opts.modelId,
      opts.filePath,
      opts.scoreThreshold
    )
  )
  .example('node $0 predict -i "modelId" -f "./resources/test.txt" -s "0.5"')
  .wrap(120)
  .recommendCommands()
  .help()
  .strict().argv;
