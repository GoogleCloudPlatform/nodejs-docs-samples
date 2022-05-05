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
 * Configures a webhook to configure new session parameters
 */

// [START dialogflow_cx_v3_webhook_configure_session_parameters]

exports.configureSessionParams = (request, response) => {
  const tag = request.body.fulfillmentInfo.tag;
  let newSessionParameter;
  const text = `${newSessionParameter}. I'm a session parameter configured by the webhook. The webhook's tag is ${tag}.`;

  if (tag === 'month') {
    newSessionParameter = 'January';
  } else if (tag === 'year') {
    newSessionParameter = '1999';
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
    sessionInfo: {
      parameters: {
        newSessionParameter: newSessionParameter,
      },
    },
  };

  response.send(jsonResponse);
};
// [END dialogflow_cx_v3_webhook_configure_session_parameters]
