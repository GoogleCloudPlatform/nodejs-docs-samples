// Copyright 2018 Google LLC
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
async function main(
  projectId = 'YOUR_PROJECT_ID',
  sessionId = 'YOUR_SESSION_ID',
  query = 'YOUR_QUERY',
  languageCode = 'YOUR_LANGUAGE_CODE'
) {
  // [START dialogflow_detect_intent_with_sentiment_analysis]
  // Imports the Dialogflow client library
  const dialogflow = require('@google-cloud/dialogflow').v2;

  // Instantiate a DialogFlow client.
  const sessionClient = new dialogflow.SessionsClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'ID of GCP project associated with your Dialogflow agent';
  // const sessionId = `user specific ID of session, e.g. 12345`;
  // const query = `phrase(s) to pass to detect, e.g. I'd like to reserve a room for six people`;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  // Define session path
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  async function detectIntentandSentiment() {
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
      queryParams: {
        sentimentAnalysisRequestConfig: {
          analyzeQueryTextSentiment: true,
        },
      },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log('  No intent matched.');
    }
    if (result.sentimentAnalysisResult) {
      console.log('Detected sentiment');
      console.log(
        `  Score: ${result.sentimentAnalysisResult.queryTextSentiment.score}`
      );
      console.log(
        `  Magnitude: ${result.sentimentAnalysisResult.queryTextSentiment.magnitude}`
      );
    } else {
      console.log('No sentiment Analysis Found');
    }
    // [END dialogflow_detect_intent_with_sentiment_analysis]
  }
  detectIntentandSentiment();
}
main(...process.argv.slice(2));
