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

// [START googlegenaisdk_vertexai_express_mode]
const {GoogleGenAI} = require('@google/genai');
const API_KEY = 'PUT HERE YOUR API KEY';

async function generateContent(apiKey = API_KEY) {
  const ai = new GoogleGenAI({
    vertexai: true,
    apiKey: apiKey,
  });

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: 'Explain bubble sort to me.',
  });

  console.log(response.text);

  return response;
}
// Example response:
//  Bubble Sort is a simple sorting algorithm that repeatedly steps through the list
// [END googlegenaisdk_vertexai_express_mode]

module.exports = {
  generateContent,
};
