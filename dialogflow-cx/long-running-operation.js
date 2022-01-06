// Copyright 2021 Google LLC
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

async function main(projectId, agentId, location) {
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const agentId = 'my-agent';
  // const location = 'global';

  // [START dialogflow_cx_log_running_operation]

  const {AgentsClient, protos} = require('@google-cloud/dialogflow-cx');

  const api_endpoint = `${location}-dialogflow.googleapis.com`;

  const client = new AgentsClient({apiEndpoint: api_endpoint});

  const exportAgentRequest =
    new protos.google.cloud.dialogflow.cx.v3.ExportAgentRequest();

  exportAgentRequest.name = `projects/${projectId}/locations/${location}/agents/${agentId}`;

  // exportAgent call returns a promise to a long running operation
  const [operation] = await client.exportAgent(exportAgentRequest);

  // Waiting for the long running opporation to finish
  const [response] = await operation.promise();

  // Prints the result of the operation when the operation is done
  console.log(response);

  // [END dialogflow_cx_log_running_operation]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
