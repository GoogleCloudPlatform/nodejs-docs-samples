// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
async function main(operationFullId = 'OPERATION_FULL_ID') {
  // [START automl_video_intelligence_classification_get_operation_status]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to get operation status.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const operationFullId = '[OPERATION_FULL_ID]'
  // eg., "projects/<projectId>/locations/us-central1/operations/<operationId>",
  // `Full name of an operation`;

  // Get the latest state of a long-running operation.
  client.operationsClient
    .getOperation({name: operationFullId})
    .then(responses => {
      const response = responses[0];
      console.log('Operation details:');
      console.log(`\tName: ${response.name}`);
      console.log('\tMetadata:');
      console.log(`\t\tType Url: ${response.metadata.typeUrl}`);
      console.log(`\tDone: ${response.done}`);

      if (response.response) {
        console.log('\tResponse:');
        console.log(`\t\tType Url: ${response.response.typeUrl}`);
      }

      if (response.error) {
        console.log('\tResponse:');
        console.log(`\t\tError code: ${response.error.code}`);
        console.log(`\t\tError message: ${response.error.message}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_video_intelligence_classification_get_operation_status]
}
main(...process.argv.slice(2)).catch(console.error());
