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

async function main(operationFullId) {
  // [START automl_cancel_operation_beta]

  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const operationFullId = 'projects/YOUR_PROJECT_ID/locations/YOUR_LOCATIOIN/operations/OPERATION_ID';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function cancelOperation() {
    client.operationsClient.cancelOperation({
      name: operationFullId,
    });

    // Wait for operation to complete.
    console.log('Cancelled operation');
  }

  cancelOperation();
  // [END automl_cancel_operation_beta]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
