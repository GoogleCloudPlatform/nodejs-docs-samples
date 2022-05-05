// Copyright 2022 Google LLC
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

/**
 * Configures a webhook to trigger a page transition. This is a simple example.
 */

// [START dialogflow_cx_v3_webhook_configure_session_parameters_trigger_transition]

exports.triggerTransition = (request, response) => {
  // The target page to transition to.
  const targetPage = request.body.targetPage; // Must be format projects/<Project ID>/locations/<Location ID>/agents/<Agent ID>/flows/<Flow ID>/pages/<Page ID>
  // The value of the parameter used to trigger transition
  let sessionParameter = request.body.sessionInfo.parameters.number;

  sessionParameter = sessionParameter *= 50;
  const text = `We multiplied your input - the value is now ${sessionParameter}. Let's go the the next page.`;
  const jsonResponse = {
    target_page: targetPage,
    fulfillment_response: {
      messages: [
        {
          text: {
            //fulfillment text response to be sent to the agent
            text: [text],
          },
        },
      ],
    },
    // Sets new value of the session parameter
    session_info: {
      parameters: {
        number: sessionParameter,
      },
    },
  };

  response.send(jsonResponse);
};
// [END dialogflow_cx_v3_webhook_configure_session_parameters_trigger_transition]
