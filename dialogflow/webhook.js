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

// [START dialogflow_es_webhook]
const functions = require('@google-cloud/functions-framework');

// TODO: Add handleWebhook to 'Entry point' in the Google Cloud Function
functions.http('handleWebhook', (request, response) => {
  const tag = request.body.queryResult.intent.displayName;

  let jsonResponse = {};
  if (tag === 'Default Welcome Intent') {
    //fulfillment response to be sent to the agent if the request tag is equal to "welcome tag"
    jsonResponse = {
      fulfillment_messages: [
        {
          text: {
            //fulfillment text response to be sent to the agent
            text: ['Hello from a GCF Webhook'],
          },
        },
      ],
    };
  } else if (tag === 'get-name') {
    //fulfillment response to be sent to the agent if the request tag is equal to "welcome tag"
    jsonResponse = {
      fulfillment_messages: [
        {
          text: {
            //fulfillment text response to be sent to the agent
            text: ['My name is Flowhook'],
          },
        },
      ],
    };
  } else {
    jsonResponse = {
      //fulfillment text response to be sent to the agent if there are no defined responses for the specified tag
      fulfillment_messages: [
        {
          text: {
            ////fulfillment text response to be sent to the agent
            text: [
              `There are no fulfillment responses defined for "${tag}"" tag`,
            ],
          },
        },
      ],
    };
  }
  response.send(jsonResponse);
});
// [END dialogflow_es_webhook]
