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

'use strict';

/**
 * Executes a Workflow and waits for the results with exponential backoff.
 * @param {string} projectId The Google Cloud Project containing the workflow
 * @param {string} location The workflow location
 * @param {string} workflow The workflow name
 */
const main = async (
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  location = 'us-central1',
  workflow = 'myFirstWorkflow'
) => {
  if (!projectId)
    return console.error('ERROR: GOOGLE_CLOUD_PROJECT is required.');

  // [START workflows_api_quickstart]
  const {ExecutionsClient} = require('@google-cloud/workflows');
  const client = new ExecutionsClient();

  /**
   * Sleeps the process N number of milliseconds.
   * @param {Number} ms The number of milliseconds to sleep.
   */
  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  // Execute workflow
  try {
    const createExecutionRes = await client.createExecution({
      parent: client.workflowPath(projectId, location, workflow),
    });
    const executionName = createExecutionRes[0].name;
    console.log(`Created execution: ${executionName}`);

    // Wait for execution to finish, then print results.
    let executionFinished = false;
    let backoffDelay = 1000; // Start wait with delay of 1,000 ms
    console.log('Poll every second for result...');
    while (!executionFinished) {
      const [execution] = await client.getExecution({
        name: executionName,
      });
      executionFinished = execution.state !== 'ACTIVE';

      // If we haven't seen the result yet, wait a second.
      if (!executionFinished) {
        console.log('- Waiting for results...');
        await sleep(backoffDelay);
        backoffDelay *= 2; // Double the delay to provide exponential backoff.
      } else {
        console.log(`Execution finished with state: ${execution.state}`);
        console.log(execution.result);
        return execution.result;
      }
    }
  } catch (e) {
    console.error(`Error executing workflow: ${e}`);
  }
  // [END workflows_api_quickstart]
};

module.exports = main;

// Call as CLI
// node . [projectId] [cloudRegion] [workflowName]
if (require.main === module) {
  main(...process.argv.slice(2));
}
