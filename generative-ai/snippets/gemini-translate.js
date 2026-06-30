// Copyright 2024 Google LLC
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
const {GoogleGenAI} = require('@google/genai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function geminiTranslation(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.5-flash'
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location,
  });

  // The text to be translated.
  const text = 'Hello! How are you doing today?';
  // The language code of the target language. Defaults to "fr" (*French).
  // Available language codes:
  // https://cloud.google.com/translate/docs/languages#neural_machine_translation_model
  const targetLanguageCode = 'fr';

  const textPart = {
    text: `
    User input:${text}
    Answer:`,
  };

  const content = `Your mission is to translate text in English to ${targetLanguageCode}`;

  const response = await client.models.generateContent({
    model: model,
    contents: [textPart],
    config: {
      maxOutputTokens: 2048,
      temperature: 0.4,
      topP: 1,
      topK: 32,
      systemInstruction: {
        parts: [{text: content}],
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    },
  });

  console.log(response.text);
  return response;
}

geminiTranslation(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
