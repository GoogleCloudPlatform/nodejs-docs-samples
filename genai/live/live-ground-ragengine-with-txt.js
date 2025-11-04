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

// [START googlegenaisdk_live_ground_ragengine_with_txt]

'use strict';

const {GoogleGenAI, Modality} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

// (DEVELOPER) put here your memory corpus
const RAG_CORPUS_ID = '';

async function generateLiveRagTextResponse(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION,
  rag_corpus_id = RAG_CORPUS_ID
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });
  const memoryCorpus = `projects/${projectId}/locations/${location}/ragCorpora/${rag_corpus_id}`;
  const modelId = 'gemini-2.0-flash-live-preview-04-09';

  // RAG store config
  const ragStore = {
    ragResources: [
      {
        ragCorpus: memoryCorpus, // Use memory corpus if you want to store context
      },
    ],
    storeContext: true, // sink context into your memory corpus
  };

  const config = {
    responseModalities: [Modality.TEXT],
    tools: [
      {
        retrieval: {
          vertexRagStore: ragStore,
        },
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

  const textInput = 'What are newest gemini models?';
  console.log('> ', textInput, '\n');

  await session.sendClientContent({
    turns: [{role: 'user', parts: [{text: textInput}]}],
  });

  const turns = await handleTurn();
  const response = [];

  for (const turn of turns) {
    if (turn.text) {
      response.push(turn.text);
    }
  }

  console.log(response.join(''));

  // Example output:
  // > What are newest gemini models?
  //  In December 2023, Google launched Gemini, their "most capable and general model". It's multimodal, meaning it understands and combines different types of information like text, code, audio, images, and video.

  session.close();

  return response;
}

// [END googlegenaisdk_live_ground_ragengine_with_txt]

module.exports = {
  generateLiveRagTextResponse,
};
