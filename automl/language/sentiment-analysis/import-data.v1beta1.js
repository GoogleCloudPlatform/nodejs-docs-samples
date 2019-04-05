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
  datasetId = 'YOUR_DATASET_ID',
  gcsPath = 'YOUR_GCS_PATH'
) {
  // [START automl_natural_language_sentiment_importData]
  const automl = require(`@google-cloud/automl`);
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to import labeled items.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TST8051890775971069952";
  // const gcsPath = '[GCS_PATH]' e.g., "gs://<bucket-name>/<csv file>",
  // `.csv paths in AutoML Natural Language Sentiment CSV format`;

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Get the multiple Google Cloud Storage URIs.
  const inputUris = gcsPath.split(`,`);
  const inputConfig = {
    gcsSource: {
      inputUris: inputUris,
    },
  };

  // Import the data from the input URI.
  client
    .importData({name: datasetFullId, inputConfig: inputConfig})
    .then(responses => {
      const operation = responses[0];
      console.log(`Processing import...`);
      return operation.promise();
    })
    .then(responses => {
      // The final result of the operation.
      const operationDetails = responses[2];

      // Get the data import details.
      console.log('Data import details:');
      console.log(`\tOperation details:`);
      console.log(`\t\tName: ${operationDetails.name}`);
      console.log(`\t\tDone: ${operationDetails.done}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_sentiment_importData]
}
main(...process.argv.slice(2)).catch(console.error());
