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

// [START googlegenaisdk_videogen_with_img]
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
    model: 'veo-3.0-generate-preview',
    prompt:
      'Extreme close-up of a cluster of vibrant wildflowers swaying gently in a sun-drenched meadow',
    image: {
      gcsUri: 'gs://cloud-samples-data/generative-ai/image/flowers.png',
      mimeType: 'image/png',
    },
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

//todo
// output GenerateVideosOperation {
//   name: 'projects/cloud-ai-devrel-softserve/locations/us-central1/publishers/google/models/veo-3.0-generate-preview/operations/adf19783-9f21-49c4-a4af-3265c2df4326',
//     metadata: undefined,
//     done: true,
//     error: {
//     code: 7,
//       message: "service-448220130128@gcp-sa-aiplatform.iam.gserviceaccount.com does not have storage.objects.create access to the Google Cloud Storage object. Permission 'storage.objects.create' denied on resource (or it may not exist). service-448220130128@gcp-sa-aiplatform.iam.gserviceaccount.com does not have storage.objects.create access to the Google Cloud Storage object. Permission 'storage.objects.create' denied on resource (or it may not exist)."
//   }
// }

// [END googlegenaisdk_videogen_with_img]

module.exports = {
  generateVideo,
};
