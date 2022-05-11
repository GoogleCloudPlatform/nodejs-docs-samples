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

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

async function main(projectId, displayName) {
  // [START dialogflow_set_agent_sample]

  const parent = 'projects/' + projectId + '/locations/global';

  const api_endpoint = 'global-dialogflow.googleapis.com';

  const agent = {
    displayName: displayName,
    defaultLanguageCode: 'en',
    timeZone: 'America/Los_Angeles',
  };

  const {AgentsClient} = require('@google-cloud/dialogflow-cx');

  const client = new AgentsClient({apiEndpoint: api_endpoint});

  async function setAgentSample() {
    const request = {
      agent,
      parent,
    };

    const [response] = await client.createAgent(request);
    console.log(`response: ${JSON.stringify(response, null, 2)}`);

    // Delete created agent resource
    client.deleteAgent({name: response.name});
  }
  await setAgentSample();
  // [END dialogflow_set_agent_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
