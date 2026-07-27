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

const {GoogleGenAI} = require('@google/genai');

/**
 * TODO(developer): Update these variables before running the sample.
 */

async function generateContent(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-2.5-flash'
) {
  // Initialize client
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const request = {
    model: model,
    contents: [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              fileUri: 'gs://cloud-samples-data/video/animals.mp4',
              mimeType: 'video/mp4',
            },
          },
          {
            fileData: {
              fileUri:
                'gs://cloud-samples-data/generative-ai/image/character.jpg',
              mimeType: 'image/jpeg',
            },
          },
          {text: 'Are this video and image correlated?'},
        ],
      },
    ],
  };

  const responseStream = await client.models.generateContentStream(request);

  for await (const chunk of responseStream) {
    console.log(chunk.text);
  }
}

generateContent(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
