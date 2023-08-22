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

// This is a generated sample, using the typeless sample bot. Please
// look for the source TypeScript sample (.ts) for modifications.
'use strict';

const projectId = process.argv[2] || process.env.GOOGLE_CLOUD_PROJECT;
const location = process.argv[3] || 'us-central1';
const workflowName = process.argv[4] || 'myFirstWorkflow';
const searchTerm = process.argv[5] || '';

// [START workflows_api_quickstart]
// [START workflows_api_quickstart_client_libraries]
const {ExecutionsClient} = require('@google-cloud/workflows');
const client = new ExecutionsClient();
// [END workflows_api_quickstart_client_libraries]
/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// const projectId = 'my-project';
// const location = 'us-central1';
// const workflow = 'myFirstWorkflow';
// const searchTerm = '';

/**
 * Executes a Workflow and waits for the results with exponential backoff.
 * @param {string} projectId The Google Cloud Project containing the workflow
 * @param {string} location The workflow location
 * @param {string} workflow The workflow name
 * @param {string} searchTerm Optional search term to pass to the Workflow as a runtime argument
 */
async function executeWorkflow(projectId, location, workflow, searchTerm) {
  /**
   * Sleeps the process N number of milliseconds.
   * @param {Number} ms The number of milliseconds to sleep.
   */
  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  const runtimeArgs = searchTerm ? {searchTerm: searchTerm} : {};
  // [START workflows_api_quickstart_execution]
  // Execute workflow
  try {
    const createExecutionRes = await client.createExecution({
      parent: client.workflowPath(projectId, location, workflow),
      execution: {
        // Runtime arguments can be passed as a JSON string
        argument: JSON.stringify(runtimeArgs),
      },
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
  // [END workflows_api_quickstart_execution]
}

executeWorkflow(projectId, location, workflowName, searchTerm).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});

// [END workflows_api_quickstart]
