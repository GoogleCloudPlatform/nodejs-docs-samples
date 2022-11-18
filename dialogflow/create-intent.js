// Copyright 2020 Google LLC
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

/**
 * Create an intent.
 * @param {string} projectId The project to be used
 * @param {string} displayName Display Name
 * @param {string} trainingPhrasesParts Training Phrases
 * @param {string} messageTexts Message Texts
 */
function main(
  projectId = 'YOUR_PROJECT_ID',
  displayName = 'YOUR_INTENT_DISPLAY_NAME',
  trainingPhrasesParts = [
    'Hello, What is weather today?',
    'How is the weather today?',
  ],
  messageTexts = ['Rainy', 'Sunny']
) {
  // [START dialogflow_create_intent]

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'The Project ID to use, e.g. 'YOUR_GCP_ID';
  // const displayName = 'The display name of the intent, e.g. 'MAKE_RESERVATION';
  // const trainingPhrasesParts = 'Training phrases, e.g. 'How many people are staying?';
  // const messageTexts = 'Message texts for the agent's response when the intent is detected, e.g. 'Your reservation has been confirmed';

  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates the Intent Client
  const intentsClient = new dialogflow.IntentsClient();

  async function createIntent() {
    // Construct request

    // The path to identify the agent that owns the created intent.
    const agentPath = intentsClient.projectAgentPath(projectId);

    const trainingPhrases = [];

    trainingPhrasesParts.forEach(trainingPhrasesPart => {
      const part = {
        text: trainingPhrasesPart,
      };

      // Here we create a new training phrase for each provided part.
      const trainingPhrase = {
        type: 'EXAMPLE',
        parts: [part],
      };

      trainingPhrases.push(trainingPhrase);
    });

    const messageText = {
      text: messageTexts,
    };

    const message = {
      text: messageText,
    };

    const intent = {
      displayName: displayName,
      trainingPhrases: trainingPhrases,
      messages: [message],
    };

    const createIntentRequest = {
      parent: agentPath,
      intent: intent,
    };

    // Create the intent
    const [response] = await intentsClient.createIntent(createIntentRequest);
    console.log(`Intent ${response.name} created`);
  }

  createIntent();

  // [END dialogflow_create_intent]
}
main(...process.argv.slice(2));
