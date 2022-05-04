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
 * Detects intent and returns a synthesized Text-to-Speech (TTS) response

 * See https://cloud.google.com/dialogflow/cx/docs/quick/api before running the code snippet.
 */

'use strict';

function main(
  projectId,
  location,
  agentId,
  sessionId,
  query,
  languageCode,
  outputFile
) {
  // [START dialogflow_cx_v3_detect_intent_synthesize_tts_response_async]

  // Imports the Cx library
  const {SessionsClient} = require('@google-cloud/dialogflow-cx');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'ID of GCP project associated with your Dialogflow agent';
  // const sessionId = `user specific ID of session, e.g. 12345`;
  // const query = `phrase(s) to pass to detect, e.g. I'd like to reserve a room for six people`;
  // const languageCode = 'BCP-47 language code, e.g. en-US';
  // const outputFile = `path for audio output file, e.g. ./resources/myOutput.wav`;

  // Instantiates a Sessions client
  const sessionsClient = new SessionsClient();

  // Define session path
  const sessionPath = sessionsClient.projectLocationAgentSessionPath(
    projectId,
    location,
    agentId,
    sessionId
  );
  const fs = require('fs');
  const util = require('util');

  async function detectIntentSynthesizeTTSResponse() {
    // Configuration of how speech should be synthesized. See https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3/OutputAudioConfig#SynthesizeSpeechConfig
    const synthesizeSpeechConfig = {
      speakingRate: 1.25,
      pitch: 10.0,
    };

    // Constructs the audio query request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
        },
        languageCode: languageCode,
      },
      outputAudioConfig: {
        audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
        synthesizeSpeechConfig: synthesizeSpeechConfig,
      },
    };

    // Sends the detectIntent request
    const [response] = await sessionsClient.detectIntent(request);
    // Output audio configurations
    console.log(
      `Speaking Rate: ${response.outputAudioConfig.synthesizeSpeechConfig.speakingRate}`
    );
    console.log(
      `Pitch: ${response.outputAudioConfig.synthesizeSpeechConfig.pitch}`
    );

    const audioFile = response.outputAudio;
    // Writes audio content to output file
    util.promisify(fs.writeFile)(outputFile, audioFile, 'binary');
    console.log(`Audio content written to file: ${outputFile}`);
  }
  detectIntentSynthesizeTTSResponse();
  // [END dialogflow_cx_v3_detect_intent_synthesize_tts_response_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
