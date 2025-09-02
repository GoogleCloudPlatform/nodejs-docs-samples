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

// [START googlegenaisdk_live_txt_with_audio]

'use strict';

const {GoogleGenAI, Modality} = require('@google/genai');
const fetch = require('node-fetch');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const modelId = 'gemini-2.0-flash-live-preview-04-09';
  const config = {
    responseModalities: [Modality.TEXT],
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
    while (!done) {
      const message = await waitMessage();
      turns.push(message);
      if (message.serverContent && message.serverContent.turnComplete) {
        done = true;
      }
    }
    return turns;
  }

  const session = await ai.live.connect({
    model: modelId,
    config: config,
    callbacks: {
      onmessage: msg => responseQueue.push(msg),
      onerror: e => console.error('Error:', e.message),
    },
  });

  const audioUrl =
    'https://storage.googleapis.com/generativeai-downloads/data/16000.wav';

  console.log('> Answer to this audio url', audioUrl);

  const res = await fetch(audioUrl);
  if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const audioBytes = Buffer.from(arrayBuffer).toString('base64');

  await session.sendRealtimeInput({
    media: {
      data: audioBytes,
      mimeType: 'audio/pcm;rate=16000',
    },
  });

  const turns = await handleTurn();

  const response = [];
  for (const turn of turns) {
    if (turn.text) {
      response.push(turn.text);
    }
  }

  console.log('Final response:', response.join(''));
  session.close();

  return response;
}

// Example output:
//> Answer to this audio url https://storage.googleapis.com/generativeai-downloads/data/16000.wav
// Final response: Yes, I can hear you. How are you doing today?
// [END googlegenaisdk_live_txt_with_audio]

module.exports = {
  generateContent,
};
