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

// [START generativeaionvertexai_gemini_video_with_audio]
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function analyze_video_with_audio(projectId = 'PROJECT_ID') {
  const vertexAI = new VertexAI({project: projectId, location: 'us-central1'});

  const generativeModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash-001',
  });

  const filePart = {
    file_data: {
      file_uri: 'gs://cloud-samples-data/generative-ai/video/pixel8.mp4',
      mime_type: 'video/mp4',
    },
  };
  const textPart = {
    text: `
    Provide a description of the video.
    The description should also contain anything important which people say in the video.`,
  };

  const request = {
    contents: [{role: 'user', parts: [filePart, textPart]}],
  };

  const resp = await generativeModel.generateContent(request);
  const contentResponse = await resp.response;
  console.log(JSON.stringify(contentResponse));
}
// [END generativeaionvertexai_gemini_video_with_audio]

analyze_video_with_audio(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
