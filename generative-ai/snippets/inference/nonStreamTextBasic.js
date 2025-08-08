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

// [START generativeaionvertexai_non_stream_text_basic]
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
const PROJECT_ID = process.env.CAIP_PROJECT_ID;
const LOCATION = process.env.LOCATION;
const MODEL = 'gemini-2.0-flash-001';

async function generateContent() {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({project: PROJECT_ID, location: LOCATION});

  // Instantiate the model
  const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL,
  });

  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Write a story about a magic backpack.',
          },
        ],
      },
    ],
  };

  console.log(JSON.stringify(request));

  const result = await generativeModel.generateContent(request);

  console.log(result.response.candidates[0].content.parts[0].text);
}
// [END generativeaionvertexai_non_stream_text_basic]

generateContent().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
