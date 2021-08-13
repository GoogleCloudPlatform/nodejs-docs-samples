// Copyright 2021 Google LLC
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
 * Waits for an operation to be completed. Calling this function will block until the operation is finished.
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} operationString - Operation instance you want to wait in string format.
 */
function main(projectId, operationString) {
  // [START compute_instances_operation_check]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const operationString = 'YOUR_OPERATION_STRING'

  const compute = require('@google-cloud/compute');

  // Parse stringified operation to the object instance.
  let operation = JSON.parse(operationString);

  async function waitForOperation() {
    const operationsClient = new compute.ZoneOperationsClient();

    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Operation finished.');
  }

  waitForOperation();
  // [END compute_instances_operation_check]
}

main(...process.argv.slice(2));
