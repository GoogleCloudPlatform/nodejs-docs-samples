// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START googlegenaisdk_live_transcribe_with_audio]

'use strict';

const {GoogleGenAI, Modality} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateLiveAudioTranscription(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const modelId = 'gemini-live-2.5-flash-preview-native-audio';
  const config = {
    responseModalities: [Modality.AUDIO],
    inputAudioTranscription: {},
    outputAudioTranscription: {},
  };

  const responseQueue = [];

  async function waitMessage() {
    while (responseQueue.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return responseQueue.shift();
  }

  async function handleTurn() {
    const turns = [];
    let done = false;
    const outputMessage = [];
    while (!done) {
      const message = await waitMessage();
      turns.push(message);

      const serverContent = message.serverContent;
      if (serverContent && serverContent.modelTurn) {
        console.log('Model turn:', serverContent.modelTurn);
      }
      if (serverContent && serverContent.inputTranscription) {
        console.log('Input transcript:', serverContent.inputTranscription.text);
      }
      if (
        serverContent &&
        serverContent.outputTranscription &&
        serverContent.outputTranscription.text
      ) {
        outputMessage.push(serverContent.outputTranscription.text);
      }
      if (serverContent && serverContent.turnComplete) {
        done = true;
      }
    }
    console.log('Output transcript:', outputMessage.join(''));
    return turns;
  }

  const session = await client.live.connect({
    model: modelId,
    config: config,
    callbacks: {
      onmessage: msg => responseQueue.push(msg),
      onerror: e => console.error('Error:', e.message),
    },
  });

  const inputTxt = 'Hello? Gemini, are you there?';
  console.log('> ', inputTxt, '\n');

  await session.sendClientContent({
    turns: [{role: 'user', parts: [{text: inputTxt}]}],
  });

  const turns = await handleTurn(session);

  // Example output:
  //> Hello? Gemini, are you there?
  // Yes, I'm here. What would you like to talk about?

  session.close();
  return turns;
}

// [END googlegenaisdk_live_transcribe_with_audio]

module.exports = {
  generateLiveAudioTranscription,
};
