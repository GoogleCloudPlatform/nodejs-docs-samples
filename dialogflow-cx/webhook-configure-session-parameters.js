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
 * Configures a webhook to set a session parameter
 */

// [START dialogflow_cx_v3_webhook_configure_session_parameters]
const functions = require('@google-cloud/functions-framework');

functions.http('configureSessionParams', (request, response) => {
  // Session parameter configured by the webhook
  const orderNumber = 123;

  const jsonResponse = {
    sessionInfo: {
      parameters: {
        orderNumber: orderNumber,
      },
    },
  };

  response.send(jsonResponse);
});
// [END dialogflow_cx_v3_webhook_configure_session_parameters]
