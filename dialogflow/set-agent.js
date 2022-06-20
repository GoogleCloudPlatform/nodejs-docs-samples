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

// parentID is the projectID and displayName is customized by user
async function main(parentId, displayName) {
  // [START dialogflow_set_agent_sample]
  const {AgentsClient} = require('@google-cloud/dialogflow');

  // make sure to pass projectID as the input parameter
  const parent = 'projects/' + parentId + '/locations/global';

  const agent = {
    parent: parent,
    displayName: displayName,
    defaultLanguageCode: 'en',
    timeZone: 'America/Los_Angeles',
  };

  const client = new AgentsClient();

  async function setAgent() {
    const request = {
      agent,
    };

    const [response] = await client.setAgent(request);
    console.log(`response: ${JSON.stringify(response, null, 2)}`);
  }
  await setAgent();
  // [END dialogflow_set_agent_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
