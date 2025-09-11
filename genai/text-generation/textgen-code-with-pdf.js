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

// [START googlegenaisdk_textgen_code_with_pdf]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateText(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const contents = [
    {
      role: 'user',
      parts: [
        {text: 'Convert this python code to use Google Python Style Guide.'},
        {
          fileData: {
            fileUri:
              'https://storage.googleapis.com/cloud-samples-data/generative-ai/text/inefficient_fibonacci_series_python_code.pdf',
            mimeType: 'application/pdf',
          },
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
  });

  console.log(response.text);

  // Example response:
  // Here's the Python code converted to adhere to the Google Python Style Guide, along with explanations for the changes:
  //
  // ```python
  // """Calculates the Fibonacci sequence up to n numbers.
  //
  // This module provides a function to generate a Fibonacci sequence,
  // demonstrating adherence to the Google Python Style Guide.
  // """
  //
  // def fibonacci(n: int) -> list[int]:
  //   """Calculates the Fibonacci sequence up to n numbers.
  //
  //   This function generates the first 'n' terms of the Fibonacci sequence,
  //   starting with 0, 1, 1, 2...
  // ...

  return response.text;
}

// [END googlegenaisdk_textgen_code_with_pdf]

module.exports = {
  generateText,
};
