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
//

/**
 * Trigger intent programmatically rather than as a result of natural language processing

 * See https://cloud.google.com/dialogflow/cx/docs/quick/api before running the code snippet.
 */

'use strict';

function main(projectId, location, agentId, intentId, languageCode) {
  // [START dialogflow_cx_v3_detect_intent_with_intent_input_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */

  /**
   * const projectId = 'your-project-id';
   * const location = 'location';
   * const agentId = 'your-agent-id';
   * const languageCode = 'your-language-code';
   */

  /**
   * The input specification. See https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3beta1/ConversationTurn#QueryInput for information about query inputs.
   */
  // const intentId = 'unique-identifier-of-the-intent-to-trigger';

  // Imports the Cx library
  const {
    SessionsClient,
    IntentsClient,
  } = require('@google-cloud/dialogflow-cx');
  /**
   * Example for regional endpoint:
   *   const location = 'us-central1'
   *   const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})
   */
  // Instantiates a Sessions client
  const sessionsClient = new SessionsClient();

  // Instantiates an Intents client
  const intentsClient = new IntentsClient();

  async function detectIntentWithIntentInput() {
    const sessionId = Math.random().toString(36).substring(7);

    // Creates session path
    const sessionPath = sessionsClient.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId
    );

    // Creates intent path. Format: projects/<Project ID>/locations/<Location ID>/agents/<Agent ID>/intents/<Intent ID>
    const intentPath = intentsClient.intentPath(
      projectId,
      location,
      agentId,
      intentId
    );

    // Construct detectIntent request
    const request = {
      session: sessionPath,
      queryInput: {
        intent: {
          intent: intentPath,
        },
        languageCode,
      },
    };

    // Send request and receive response
    const [response] = await sessionsClient.detectIntent(request);

    // Display the name of the detected intent
    console.log('Intent Name: \n');
    console.log(response.queryResult.intent.displayName);

    // Agent responds with fulfillment message of the detected intent
    console.log('Agent Response: \n');
    console.log(response.queryResult.responseMessages[0].text.text[0]);
  }

  detectIntentWithIntentInput();
  // [END dialogflow_cx_v3_detect_intent_with_intent_input_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
