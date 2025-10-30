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

// [START googlegenaisdk_imggen_subj_refer_ctrl_refer_with_txt_imgs]
const {
  GoogleGenAI,
  ControlReferenceImage,
  SubjectReferenceImage,
} = require('@google/genai');

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

  const subjectReferenceImage = new SubjectReferenceImage();
  subjectReferenceImage.referenceId = 1;
  subjectReferenceImage.referenceImage = {
    gcsUri: 'gs://cloud-samples-data/generative-ai/image/person.png',
  };
  subjectReferenceImage.config = {
    subjectDescription: 'a headshot of a woman',
    subjectType: 'SUBJECT_TYPE_PERSON',
  };

  const controlReferenceImage = new ControlReferenceImage();
  controlReferenceImage.referenceId = 2;
  controlReferenceImage.referenceImage = {
    gcsUri: 'gs://cloud-samples-data/generative-ai/image/person.png',
  };
  controlReferenceImage.config = {
    controlType: 'CONTROL_TYPE_FACE_MESH',
  };

  // TODO(developer): Update and un-comment below line
  // outputGcsUri = "gs://your-bucket/your-prefix"

  const response = await client.models.editImage({
    model: 'imagen-3.0-capability-001',
    prompt:
      'a portrait of a woman[1] in the pose of the control image[2]in a watercolor style by a professional artist,\n' +
      '        light and low-contrast stokes, bright pastel colors, a warm atmosphere, clean background, grainy paper,\n' +
      '        bold visible brushstrokes, patchy details',
    referenceImages: [subjectReferenceImage, controlReferenceImage],
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
// [END googlegenaisdk_imggen_subj_refer_ctrl_refer_with_txt_imgs]

module.exports = {
  generateImage,
};
