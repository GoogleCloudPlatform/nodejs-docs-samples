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
 * Configures a webhook to set form parameters as optional/required
 */

// [START dialogflow_cx_v3_configure_webhooks_to_set_form_parameter_as_optional_or_required]
const functions = require('@google-cloud/functions-framework');

functions.http('configureOptionalFormParam', (request, response) => {
  // The value of the parameter that the webhook will set as optional or required.
  // Note that the webhook cannot add or remove any form parameter

  const jsonResponse = {
    pageInfo: {
      formInfo: {
        parameterInfo: [
          {
            displayName: 'order-number',
            // if required: false, the agent will not reprompt for this parameter, even if the state is 'INVALID'
            required: true,
            state: 'VALID',
          },
        ],
      },
    },
  };

  // Info about form parameter that is sent in the webhook response:
  console.log(
    'Parameter Info: \n',
    jsonResponse.pageInfo.formInfo.parameterInfo[0]
  );

  response.send(jsonResponse);
});
// [END dialogflow_cx_v3_configure_webhooks_to_set_form_parameter_as_optional_or_required]
