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

async function main(projectId, agentId, intentId, location, displayName) {
  // [START dialogflow_cx_update_intent]

  const {IntentsClient} = require('@google-cloud/dialogflow-cx');

  const intentClient = new IntentsClient();

  //TODO(developer): Uncomment these variables before running the sample.
  //  const projectId = 'your-project-id';
  //  const agentId = 'your-agent-id';
  //  const intentId = 'your-intent-id';
  //  const location = 'your-location';
  //  const displayName = 'your-display-name';

  async function updateIntent() {
    const agentPath = intentClient.projectPath(projectId);
    const intentPath = `${agentPath}/locations/${location}/agents/${agentId}/intents/${intentId}`;

    //Gets the intent from intentPath
    const intent = await intentClient.getIntent({name: intentPath});
    intent[0].displayName = displayName;

    //Specifies what is being updated
    const updateMask = {
      paths: ['display_name'],
    };

    const updateIntentRequest = {
      intent: intent[0],
      updateMask,
      languageCode: 'en',
    };

    //Send the request for update the intent.
    const result = await intentClient.updateIntent(updateIntentRequest);
    console.log(result);
  }

  updateIntent();

  // [END dialogflow_cx_update_intent]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
