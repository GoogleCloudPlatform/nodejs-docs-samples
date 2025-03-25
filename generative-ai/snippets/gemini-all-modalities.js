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

// [START generativeaionvertexai_gemini_all_modalities]
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function analyze_all_modalities(projectId = 'PROJECT_ID') {
  const vertexAI = new VertexAI({project: projectId, location: 'us-central1'});

  const generativeModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash-001',
  });

  const videoFilePart = {
    file_data: {
      file_uri:
        'gs://cloud-samples-data/generative-ai/video/behind_the_scenes_pixel.mp4',
      mime_type: 'video/mp4',
    },
  };
  const imageFilePart = {
    file_data: {
      file_uri:
        'gs://cloud-samples-data/generative-ai/image/a-man-and-a-dog.png',
      mime_type: 'image/png',
    },
  };

  const textPart = {
    text: `
    Watch each frame in the video carefully and answer the questions.
    Only base your answers strictly on what information is available in the video attached.
    Do not make up any information that is not part of the video and do not be too
    verbose, be to the point.

    Questions:
    - When is the moment in the image happening in the video? Provide a timestamp.
    - What is the context of the moment and what does the narrator say about it?`,
  };

  const request = {
    contents: [{role: 'user', parts: [videoFilePart, imageFilePart, textPart]}],
  };

  const resp = await generativeModel.generateContent(request);
  const contentResponse = await resp.response;
  console.log(JSON.stringify(contentResponse));
}
// [END generativeaionvertexai_gemini_all_modalities]

analyze_all_modalities(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
