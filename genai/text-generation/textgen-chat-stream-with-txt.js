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

// [START googlegenaisdk_textgen_chat_stream_with_txt]
const {GoogleGenAI} = require('@google/genai');

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

  const chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
  });

  for await (const chunk of await chatSession.sendMessageStream({
    message: 'Why is the sky blue?',
  })) {
    console.log(chunk.text);
  }
  // Example response:
  // The
  // sky appears blue due to a phenomenon called **Rayleigh scattering**. Here's
  // a breakdown of why:
  // ...
  return true;
}

// [END googlegenaisdk_textgen_chat_stream_with_txt]

module.exports = {
  generateContent,
};
