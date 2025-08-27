// Copyright 2025 Google LLC
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

'use strict';
// [START googlegenaisdk_live_ground_googsearch_with_txt]
const {GoogleGenAI, Modality} = require('@google/genai');

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
    tools: [{googleSearch: {}}],
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

  const textInput =
    'When did the last Poland vs. Portugal soccer match happen?';
  console.log('> ', textInput, '\n');

  await session.sendClientContent({
    turns: [{role: 'user', parts: [{text: textInput}]}],
  });

  const turns = await handleTurn();
  for (const turn of turns) {
    if (turn.text) {
      console.log('Received text:', turn.text);
    }
  }
  session.close();
  return turns;
}
// Example output:
//> When did the last Poland vs. Portugal soccer match happen?
// Received text: The most recent match between Portugal and Poland took place on November 15,
// Received text: 2024, where Portugal won 5-1. There was also a match
// Received text: on October 12, 2024, where Poland won 3-1.
// // [END googlegenaisdk_live_ground_googsearch_with_txt]

module.exports = {
  generateContent,
};
