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
  languageCode = 'YOUR_LANGUAGE_CODE',
  outputFile = 'YOUR_OUTPUT_FILE'
) {
  // [START dialogflow_detect_intent_with_texttospeech_response]
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
  // const outputFile = `path for audio output file, e.g. ./resources/myOutput.wav`;

  // Define session path
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  const fs = require('fs');
  const util = require('util');

  async function detectIntentwithTTSResponse() {
    // The audio query request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
      outputAudioConfig: {
        audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
      },
    };
    sessionClient.detectIntent(request).then(responses => {
      console.log('Detected intent:');
      const audioFile = responses[0].outputAudio;
      util.promisify(fs.writeFile)(outputFile, audioFile, 'binary');
      console.log(`Audio content written to file: ${outputFile}`);
    });
  }
  detectIntentwithTTSResponse();
  // [END dialogflow_detect_intent_with_texttospeech_response]
}

main(...process.argv.slice(2));
