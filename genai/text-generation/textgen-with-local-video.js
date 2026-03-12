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

// [START googlegenaisdk_textgen_with_local_video]
const {GoogleGenAI} = require('@google/genai');
const fs = require('fs');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateText(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const videoContent = fs.readFileSync('test-data/describe_video_content.mp4');

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: [
      {
        inlineData: {
          data: videoContent.toString('base64'),
          mimeType: 'video/mp4',
        },
      },
      {text: 'Write a short and engaging blog post based on this video.'},
    ],
    config: {
      mediaResolution: 'MEDIA_RESOLUTION_LOW',
    },
  });

  console.log(response.text);

  // Example response:
  // Okay, here's a short and engaging blog post based on the climbing video:
  // **Title: Conquering the Wall: A Glimpse into the World of Indoor Climbing**
  // ...

  return response.text;
}

// [END googlegenaisdk_textgen_with_local_video]

module.exports = {
  generateText,
};
