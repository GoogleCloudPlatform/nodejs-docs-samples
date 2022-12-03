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

async function main(projectId, intentId, displayName) {
  // [START dialogflow_update_intent_sample]
  const {IntentsClient} = require('@google-cloud/dialogflow');

  const intentClient = new IntentsClient();

  const agentPath = intentClient.projectAgentPath(projectId);
  const intentPath = agentPath + '/intents/' + intentId;

  const intent = await intentClient.getIntent({name: intentPath});
  intent[0].displayName = displayName;
  const updateMask = {
    paths: ['display_name'],
  };

  const updateIntentRequest = {
    intent: intent[0],
    updateMask: updateMask,
    languageCode: 'en',
  };

  //Send the request for update the intent.
  const result = await intentClient.updateIntent(updateIntentRequest);
  console.log(result);
  // [END dialogflow_update_intent_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
