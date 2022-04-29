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
 * Configures a webhook to enable an agent response.
 */

// [START dialogflow_cx_v3_webhook_configure_session_parameters_enable_agent_response]

// TODO (developer): change entry point to enableAgentResponse in Cloud Function

exports.enableAgentResponse = (request, response) => {
  const tag = request.body.fulfillmentInfo.tag;
  // The value of the parameter used to enable agent response
  let sessionParameter = request.body.sessionInfo.parameters.number;
  let text = '';

  if (tag === 'increase number') {
    sessionParameter = sessionParameter += 100;
    text = `The new increased value of the number parameter is ${sessionParameter}`;
  } else if (tag === 'decrease number') {
    sessionParameter -= 50;
    text = `The new decreased value of the number parameter is ${sessionParameter}`;
  }

  const jsonResponse = {
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
    // Webhook returns configured session parameter value
    session_info: {
      parameters: {
        number: sessionParameter,
      },
    },
  };

  console.log(
    'Configured Parameter: ',
    jsonResponse.session_info.parameters.number
  );
  // Response message returned by the agent
  console.log(
    'AGENT RESPONSE: ',
    jsonResponse.fulfillment_response.messages[0].text.text
  );
  response.send(jsonResponse);
};
// [END dialogflow_cx_v3_webhook_configure_session_parameters_enable_agent_response]
