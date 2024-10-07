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

async function geminiTranslation(projectId) {
  // [START generativeaionvertexai_gemini_translate]
  const {
    VertexAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require('@google-cloud/vertexai');
  /**
   * TODO(developer): Update/uncomment these variables before running the sample.
   */
  // projectId = 'your-project-id';
  const location = 'us-central1';
  const modelName = 'gemini-1.0-pro';
  // The text to be translated.
  const text = 'Hello! How are you doing today?';
  // The language code of the target language. Defaults to "fr" (*French).
  // Available language codes:
  // https://cloud.google.com/translate/docs/languages#neural_machine_translation_model
  const targetLanguageCode = 'fr';

  const generationConfig = {
    maxOutputTokens: 2048,
    temperature: 0.4,
    topP: 1,
    topK: 32,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const content = `Your mission is to translate text in English to ${targetLanguageCode}`;

  const vertexAI = new VertexAI({project: projectId, location});
  // Instantiate models
  const generativeModel = vertexAI.getGenerativeModel({
    model: modelName,
    safetySettings,
    generationConfig,
    systemInstruction: {
      parts: [{text: content}],
    },
  });

  const textPart = {
    text: `
    User input:${text}
    Answer:`,
  };

  const request = {
    contents: [{role: 'user', parts: [textPart]}],
  };

  const result = await generativeModel.generateContent(request);
  const contentResponse = await result.response;
  console.log(JSON.stringify(contentResponse));
  return contentResponse;
  // [END generativeaionvertexai_gemini_translate]
}

geminiTranslation(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
