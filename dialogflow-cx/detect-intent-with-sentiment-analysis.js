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
 * Detects intent with sentiment analysis
 *
 * See https://cloud.google.com/dialogflow/cx/docs/quick/api before running the code snippet.
 */

'use strict';

function main(projectId, location, agentId, query, languageCode) {
  // [START dialogflow_cx_v3_detect_intent_sentiment_analysis_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The name of the session this query is sent to.
   *  Format: `projects/<Project ID>/locations/<Location ID>/agents/<Agent
   *  ID>/sessions/<Session ID>` or `projects/<Project ID>/locations/<Location
   *  ID>/agents/<Agent ID>/environments/<Environment ID>/sessions/<Session ID>`.
   *  If `Environment ID` is not specified, we assume default 'draft'
   *  environment.
   *  It's up to the API caller to choose an appropriate `Session ID`. It can be
   *  a random number or some type of session identifiers (preferably hashed).
   *  The length of the `Session ID` must not exceed 36 characters.
   *  For more information, see the sessions
   *  guide (https://cloud.google.com/dialogflow/cx/docs/concept/session).
   *  Note: Always use agent versions for production traffic.
   *  See Versions and
   *  environments (https://cloud.google.com/dialogflow/cx/docs/concept/version).
   */

  /**
   * Optional. The parameters of this query.
   */
  // const queryParams = {}
  /**
   *  Required. The input specification. See https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3beta1/ConversationTurn#QueryInput for information about query inputs.
   */
  // const text = 'text-of-your-query';

  // Imports the Cx library
  const {SessionsClient} = require('@google-cloud/dialogflow-cx');
  /**
   * Example for regional endpoint:
   *   const location = 'us-central1'
   *   const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})
   */
  // Instantiates a client
  const cxClient = new SessionsClient();

  // Configures whether sentiment analysis should be performed. If not provided, sentiment analysis is not performed.
  const analyzeQueryTextSentiment = true;

  async function detectIntentWithSentimentAnalysis() {
    const sessionId = Math.random().toString(36).substring(7);
    const sessionPath = cxClient.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId
    );

    // Construct detect intent request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
        },
        languageCode,
      },
      queryParams: {
        analyzeQueryTextSentiment: analyzeQueryTextSentiment,
      },
    };

    // Run request
    const [response] = await cxClient.detectIntent(request);
    console.log(`User Query: ${query}`);

    // Shows result of sentiment analysis (sentimentAnalysisResult)
    const sentimentAnalysis = response.queryResult.sentimentAnalysisResult;

    // Determines sentiment score of user query
    let sentiment;
    if (sentimentAnalysis.score < 0) {
      sentiment = 'negative';
    } else if (sentimentAnalysis.score > 0) {
      sentiment = 'positive';
    } else {
      sentiment = 'neutral';
    }
    console.log(
      `User input sentiment has a score of ${sentimentAnalysis.score}, which indicates ${sentiment} sentiment.`
    );
  }

  detectIntentWithSentimentAnalysis();
  // [END dialogflow_cx_v3_detect_intent_sentiment_analysis_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
