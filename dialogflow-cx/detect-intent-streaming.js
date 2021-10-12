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

async function main(
  projectId,
  location,
  agentId,
  audioFileName,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START dialogflow_cx_detect_intent_streaming]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const location = 'global';
  // const agentId = 'my-agent';
  // const audioFileName = '/path/to/audio.raw';
  // const encoding = 'AUDIO_ENCODING_LINEAR_16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'en'

  // Imports the Google Cloud Some API library
  const {SessionsClient} = require('@google-cloud/dialogflow-cx');
  /**
   * Example for regional endpoint:
   *   const location = 'us-central1'
   *   const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})
   */
  const client = new SessionsClient();

  const fs = require('fs');
  const util = require('util');
  const {Transform, pipeline} = require('stream');
  const pump = util.promisify(pipeline);

  async function detectIntentAudio() {
    const sessionId = Math.random().toString(36).substring(7);
    const sessionPath = client.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId
    );
    console.info(sessionPath);

    // Create a stream for the streaming request.
    const detectStream = client
      .streamingDetectIntent()
      .on('error', console.error)
      .on('data', data => {
        if (data.recognitionResult) {
          console.log(
            `Intermediate Transcript: ${data.recognitionResult.transcript}`
          );
        } else {
          console.log('Detected Intent:');
          const result = data.detectIntentResponse.queryResult;

          console.log(`User Query: ${result.transcript}`);
          for (const message of result.responseMessages) {
            if (message.text) {
              console.log(`Agent Response: ${message.text.text}`);
            }
          }
          if (result.match.intent) {
            console.log(`Matched Intent: ${result.match.intent.displayName}`);
          }
          console.log(`Current Page: ${result.currentPage.displayName}`);
        }
      });

    // Write the initial stream request to config for audio input.
    const initialStreamRequest = {
      session: sessionPath,
      queryInput: {
        audio: {
          config: {
            audioEncoding: encoding,
            sampleRateHertz: sampleRateHertz,
            synthesize_speech_config: {
              voice: {
                // Set's the name and gender of the ssml voice
                name: 'en-GB-Standard-A',
                ssml_gender: 'SSML_VOICE_GENDER_FEMALE',
              },
            },
            singleUtterance: true,
          },
        },
        languageCode: languageCode,
      },
    };
    detectStream.write(initialStreamRequest);

    // Stream the audio from audio file to Dialogflow.
    await pump(
      fs.createReadStream(audioFileName),
      // Format the audio stream into the request format.
      new Transform({
        objectMode: true,
        transform: (obj, _, next) => {
          next(null, {queryInput: {audio: {audio: obj}}});
        },
      }),
      detectStream
    );
  }

  detectIntentAudio();
  // [END dialogflow_cx_detect_intent_streaming]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
