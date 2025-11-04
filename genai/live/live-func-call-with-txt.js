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

// [START googlegenaisdk_live_func_call_with_txt]

'use strict';

const {GoogleGenAI, Modality} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateLiveFunctionCall(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const modelId = 'gemini-2.0-flash-live-preview-04-09';

  const config = {
    responseModalities: [Modality.TEXT],
    tools: [
      {
        functionDeclarations: [
          {name: 'turn_on_the_lights'},
          {name: 'turn_off_the_lights'},
        ],
      },
    ],
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

      if (message.toolCall) {
        for (const fc of message.toolCall.functionCalls) {
          console.log(`Model requested function call: ${fc.name}`);

          await session.sendToolResponse({
            functionResponses: [
              {
                id: fc.id,
                name: fc.name,
                response: {result: 'ok'},
              },
            ],
          });
          console.log(`Sent tool response for ${fc.name}:`, {result: 'ok'});
        }
      }

      if (message.serverContent && message.serverContent.turnComplete) {
        done = true;
      }
    }
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

  const textInput = 'Turn on the lights please';
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

  // Example output:
  //>> Turn on the lights please
  // Model requested function call: turn_on_the_lights
  // Sent tool response for turn_on_the_lights: { result: 'ok' }

  session.close();
  return turns;
}

// [END googlegenaisdk_live_func_call_with_txt]

module.exports = {
  generateLiveFunctionCall,
};
