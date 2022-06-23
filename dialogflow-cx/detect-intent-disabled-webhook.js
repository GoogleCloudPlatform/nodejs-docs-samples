// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(projectId, location, agentId, query, languageCode) {
  // [START dialogflow_cx_detect_intent_with_disabled_webhook]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const location = 'global';
  // const agentId = 'my-agent';
  // const query = 'Hello';
  // const languageCode = 'en'

  const {SessionsClient} = require('@google-cloud/dialogflow-cx');
  /**
   * Example for regional endpoint:
   *   const location = 'us-central1'
   *   const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})
   */
  const client = new SessionsClient();

  async function detectIntentText() {
    const sessionId = Math.random().toString(36).substring(7);
    const sessionPath = client.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId
    );
    console.info(sessionPath);

    const request = {
      session: sessionPath,
      queryParams: {
        disableWebhook: true,
      },
      queryInput: {
        text: {
          text: query,
        },
        languageCode,
      },
    };
    const [response] = await client.detectIntent(request);
    console.log(`Detect Intent Request: ${request.queryParams.disableWebhook}`);
    for (const message of response.queryResult.responseMessages) {
      if (message.text) {
        console.log(`Agent Response: ${message.text.text}`);
      }
    }
  }

  detectIntentText();
  // [END dialogflow_cx_detect_intent_with_disabled_webhook]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
