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

// [START googlegenaisdk_counttoken_with_txt_vid]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function countTokens(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const video = {
    fileData: {
      fileUri: 'gs://cloud-samples-data/generative-ai/video/pixel8.mp4',
      mimeType: 'video/mp4',
    },
  };

  const response = await client.models.countTokens({
    model: 'gemini-2.5-flash',
    contents: [video, 'Provide a description of the video.'],
  });

  console.log(response);

  return response.totalTokens;
}
// [END googlegenaisdk_counttoken_with_txt_vid]

module.exports = {
  countTokens,
};
