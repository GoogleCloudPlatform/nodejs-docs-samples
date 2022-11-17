// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  modelId = 'YOUR_MODEL_ID',
  inputUri = 'gs://YOUR_BUCKET_ID/path_to_your_input_csv_or_jsonl',
  outputUri = 'gs://YOUR_BUCKET_ID/path_to_save_results/'
) {
  // [START automl_batch_predict_beta]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const modelId = 'YOUR_MODEL_ID';
  // const inputUri = 'gs://YOUR_BUCKET_ID/path_to_your_input_csv_or_jsonl';
  // const outputUri = 'gs://YOUR_BUCKET_ID/path_to_save_results/';

  // Imports the Google Cloud AutoML library
  const {PredictionServiceClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const client = new PredictionServiceClient();

  async function batchPredict() {
    // Construct request
    const request = {
      name: client.modelPath(projectId, location, modelId),
      inputConfig: {
        gcsSource: {
          inputUris: [inputUri],
        },
      },
      outputConfig: {
        gcsDestination: {
          outputUriPrefix: outputUri,
        },
      },
    };

    const [operation] = await client.batchPredict(request);

    console.log('Waiting for operation to complete...');
    // Wait for operation to complete.
    const [response] = await operation.promise();
    console.log(
      `Batch Prediction results saved to Cloud Storage bucket. ${response}`
    );
  }

  batchPredict();
  // [END automl_batch_predict_beta]
}

main(...process.argv.slice(2));
