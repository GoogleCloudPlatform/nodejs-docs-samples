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

// [START googlegenaisdk_textgen_transcript_with_gcs_audio]
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

  const prompt = `Transcribe the interview, in the format of timecode, speaker, caption.
    Use speaker A, speaker B, etc. to identify speakers.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {text: prompt},
      {
        fileData: {
          fileUri: 'gs://cloud-samples-data/generative-ai/audio/pixel.mp3',
          mimeType: 'audio/mpeg',
        },
      },
    ],
    config: {
      audioTimestamp: true,
    },
  });

  console.log(response.text);

  return response.text;
}
// Example response:
// [00:00:00] **Speaker A:** your devices are getting better over time. And so ...
// [00:00:14] **Speaker B:** Welcome to the Made by Google podcast where we meet ...
// [00:00:20] **Speaker B:** Here's your host, Rasheed Finch.
// [00:00:23] **Speaker C:** Today we're talking to Aisha Sharif and DeCarlos Love. ...
// ...
// [END googlegenaisdk_textgen_transcript_with_gcs_audio]

module.exports = {
  generateContent,
};
