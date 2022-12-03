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

async function main(
  projectId,
  location,
  agentId,
  audioFileName,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START dialogflow_cx_streaming_detect_intent_enable_partial_response]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const location = 'global';
  // const agentId = 'my-agent';
  // const audioFileName = '/path/to/audio.raw';
  // const encoding = 'AUDIO_ENCODING_LINEAR_16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'en';

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

  async function streamingDetectIntentPartialResponse() {
    const sessionId = Math.random().toString(36).substring(7);
    const sessionPath = client.projectLocationAgentSessionPath(
      projectId,
      location,
      agentId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        audio: {
          config: {
            audio_encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            singleUtterance: true,
          },
        },
        languageCode: languageCode,
      },
      enablePartialResponse: true,
    };

    const stream = await client.streamingDetectIntent();
    stream.on('data', data => {
      if (data.detectIntentResponse) {
        const result = data.detectIntentResponse.queryResult;

        for (const message of result.responseMessages) {
          if (message.text) {
            console.log(`Agent Response: ${message.text.text}`);
          }
        }
      }
    });
    stream.on('error', err => {
      console.log(err);
    });
    stream.on('end', () => {
      /* API call completed */
    });
    stream.write(request);

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
      stream
    );
  }
  streamingDetectIntentPartialResponse();
  // [END dialogflow_cx_streaming_detect_intent_enable_partial_response]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
