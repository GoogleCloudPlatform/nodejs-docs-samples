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

// [START googlegenaisdk_imggen_canny_ctrl_type_with_txt_img]
const {GoogleGenAI, ControlReferenceImage} = require('@google/genai');

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

  const controlReferenceImage = new ControlReferenceImage();
  controlReferenceImage.referenceId = 1;
  controlReferenceImage.referenceImage = {
    gcsUri: 'gs://cloud-samples-data/generative-ai/image/car_canny.png',
  };
  controlReferenceImage.config = {
    controlType: 'CONTROL_TYPE_CANNY',
  };

  // TODO(developer): Update and un-comment below line
  // outputGcsUri = "gs://your-bucket/your-prefix"

  const response = await client.models.editImage({
    model: 'imagen-3.0-capability-001',
    prompt: 'a watercolor painting of a red car[1] driving on a road',
    referenceImages: [controlReferenceImage],
    config: {
      editMode: 'EDIT_MODE_CONTROLLED_EDITING',
      numberOfImages: 1,
      safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE',
      personGeneration: 'ALLOW_ADULT',
      outputGcsUri: outputGcsUri,
    },
  });
  console.log(response.generatedImages);

  // Example response:
  //  gs://your-bucket/your-prefix
  return response.generatedImages;
}
// [END googlegenaisdk_imggen_canny_ctrl_type_with_txt_img]

module.exports = {
  generateImage,
};
