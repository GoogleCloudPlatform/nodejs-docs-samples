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

// [START googlegenaisdk_live_audio_with_txt]

'use strict';

const {GoogleGenAI, Modality} = require('@google/genai');
const fs = require('fs');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateLiveConversation(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const voiceName = 'Aoede';
  const modelId = 'gemini-2.0-flash-live-preview-04-09';
  const config = {
    responseModalities: [Modality.AUDIO],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voiceName,
        },
      },
    },
  };

  const responseQueue = [];

  async function waitMessage() {
    while (responseQueue.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return responseQueue.shift();
  }

  async function handleTurn() {
    const audioChunks = [];
    let done = false;

    while (!done) {
      const message = await waitMessage();

      const sc = message.serverContent;
      if (sc && sc.modelTurn && sc.modelTurn.parts) {
        for (const part of sc.modelTurn.parts) {
          if (part && part.inlineData && part.inlineData.data) {
            audioChunks.push(Buffer.from(part.inlineData.data));
          }
        }
      }

      if (sc && sc.turnComplete) {
        done = true;
      }
    }

    return audioChunks;
  }

  const session = await client.live.connect({
    model: modelId,
    config: config,
    callbacks: {
      onmessage: msg => responseQueue.push(msg),
      onerror: e => console.error('Error:', e.message),
    },
  });

  const textInput = 'Hello? Gemini are you there?';
  console.log('> ', textInput, '\n');

  await session.sendClientContent({
    turns: [{role: 'user', parts: [{text: textInput}]}],
  });

  const audioChunks = await handleTurn(session);

  session.close();

  if (audioChunks.length > 0) {
    const audioBuffer = Buffer.concat(audioChunks);
    fs.writeFileSync('response.raw', audioBuffer);
    console.log('Received audio answer (saved to response.raw)');
  }

  // Example output:
  //> Hello? Gemini, are you there?
  // Received audio answer (saved to response.raw)

  return audioChunks;
}

// [END googlegenaisdk_live_audio_with_txt]

module.exports = {
  generateLiveConversation,
};
