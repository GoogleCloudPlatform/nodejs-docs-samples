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

// [START googlegenaisdk_imggen_raw_reference_with_txt_img]

'use strict';

const {GoogleGenAI, RawReferenceImage} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

async function generateImage(
  outputGcsUri,
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const referenceImages = new RawReferenceImage();
  referenceImages.referenceId = 1;
  referenceImages.referenceImage = {
    gcsUri: 'gs://cloud-samples-data/generative-ai/image/teacup-1.png',
  };

  // TODO(developer): Update and un-comment below line
  // outputGcsUri = "gs://your-bucket/your-prefix"

  const response = await client.models.editImage({
    model: 'imagen-3.0-capability-001',
    prompt:
      'transform the subject in the image so that the teacup[1] is made entirely out of chocolate',
    referenceImages: [referenceImages],
    config: {
      editMode: 'EDIT_MODE_DEFAULT',
      numberOfImages: 1,
      safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
      personGeneration: 'ALLOW_ADULT',
      outputGcsUri: outputGcsUri,
    },
  });

  console.log(response);

  // Example response:
  // gs://your-bucket/your-prefix

  return response.generatedImages[0].image.gcsUri;
}
// [END googlegenaisdk_imggen_raw_reference_with_txt_img]

module.exports = {
  generateImage,
};
