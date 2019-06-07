/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`use strict`;
async function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  modelId = 'YOUR_MODEL_ID',
  filePath = 'YOUR_LOCAL_FILE_PATH'
) {
  // [START automl_natural_language_entity_predict]
  const automl = require(`@google-cloud/automl`);
  const fs = require(`fs`);

  // Create client for prediction service.
  const client = new automl.v1beta1.PredictionServiceClient();

  /**
   * Demonstrates using the AutoML client to Extract the text content
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const modelId = '[MODEL_ID]' e.g., "TEN5200971474357190656";
  // const filePath = '[LOCAL_FILE_PATH]' e.g., "./resource/test.txt",
  // `local text file path of content to be extracted`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Read the file content for prediction.
  const snippet = fs.readFileSync(filePath, `utf8`);

  // Set the payload by giving the content and type of the file.
  const payload = {
    textSnippet: {
      content: snippet,
      mimeType: `text/plain`,
    },
  };

  // Params is additional domain-specific parameters.
  // Currently there is no additional parameters supported.
  client
    .predict({name: modelFullId, payload: payload, params: {}})
    .then(responses => {
      console.log(`Prediction results:`);
      for (const result of responses[0].payload) {
        console.log(
          `\tPredicted text extract entity type: ${result.displayName}`
        );
        console.log(
          `\tPredicted text extract entity content: ${result.textExtraction.textSegment.content}`
        );
        console.log(
          `\tPredicted text start offset: ${result.textExtraction.textSegment.startOffset}`
        );
        console.log(
          `\tPredicted text end offset: ${result.textExtraction.textSegment.endOffset}`
        );
        console.log(
          `\tPredicted text score: ${result.textExtraction.score} \n`
        );
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_entity_predict]
}
main(...process.argv.slice(2)).catch(console.error());
