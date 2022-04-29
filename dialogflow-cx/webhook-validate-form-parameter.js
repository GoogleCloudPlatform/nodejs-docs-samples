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
 * Uses a webhook to validate or invalidate form parameters.
 */

// [START dialogflow_cx_v3_webhook_validate_form_parameter]

// TODO (developer): change entry point to validateParameter in Cloud Function

exports.validateParameter = (request, response) => {
  // The value of the parameter to validate
  let paramToValidate = request.body.pageInfo.formInfo.parameterInfo[0].value;
  let text = '';
  let paramState;

  // Webhook will validate or invalidate parameter based on conditions configured by the user
  if (paramToValidate > 15) {
    text = 'That is too many! Please pick another number.';
    paramState = 'INVALID';
    paramToValidate = null;
  } else {
    text = 'That is a number I can work with!';
    paramState = 'VALID';
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
    page_info: {
      form_info: {
        parameter_info: [
          {
            displayName: 'paramToValidate',
            required: true,
            state: paramState,
          },
        ],
      },
    },
    sessionInfo: {
      parameters: {
        // Set session parameter to null if your agent needs to reprompt the user
        paramToValidate: paramToValidate,
      },
    },
  };

  response.send(jsonResponse);
};
// [END dialogflow_cx_v3_webhook_validate_form_parameter]
