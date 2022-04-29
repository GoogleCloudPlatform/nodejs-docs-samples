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

// [START dialogflow_cx_v3_webhook_configure_optional_or_required_form_params]

// TODO (developer): change entry point to configureOptionalFormParam in Cloud Function

exports.configureOptionalFormParam = (request, response) => {
  const tag = request.body.fulfillmentInfo.tag;
  // The value of the parameter used to enable agent response
  const formParameter = request.body.pageInfo.formInfo.parameterInfo[0].value;
  let isRequired;
  let text = '';

  if (tag === 'optional') {
    isRequired = false;
    text = 'This parameter is optional.';
  } else {
    isRequired = true;
    text = 'This parameter is required.';
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
    pageInfo: {
      formInfo: {
        parameterInfo: [
          {
            displayName: formParameter,
            // if required: false, the agent will not reprompt for this parameter, even if the state is 'INVALID'
            required: isRequired,
            state: 'VALID',
          },
        ],
      },
    },
    // Set session parameter to null if you want to reprompt the user to enter a required parameter
    sessionInfo: {
      parameterInfo: {
        formParameter: formParameter,
      },
    },
  };

  response.send(jsonResponse);
};
// [END dialogflow_cx_v3_webhook_configure_optional_or_required_form_params]
