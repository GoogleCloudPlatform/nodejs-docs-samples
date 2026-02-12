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

// [START googlegenaisdk_videogen_with_txt]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateVideo(
  outputGcsUri,
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  let operation = await client.models.generateVideos({
    model: 'veo-3.1-fast-generate-001',
    prompt: 'a cat reading a book',
    config: {
      aspectRatio: '16:9',
      outputGcsUri: outputGcsUri,
    },
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 15000));
    operation = await client.operations.get({operation: operation});
    console.log(operation);
  }

  if (operation.response) {
    console.log(operation.response.generatedVideos[0].video.uri);
  }
  return operation;
}

// [END googlegenaisdk_videogen_with_txt]

module.exports = {
  generateVideo,
};
