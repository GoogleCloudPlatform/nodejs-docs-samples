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

// [START googlegenaisdk_tuning_textgen_with_txt]
const {GoogleGenAI} = require('@google/genai');
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const TUNING_JOB_NAME = 'TestJobName';

async function generateContent(
  tuningJobName = TUNING_JOB_NAME,
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const tuningJob = await client.tunings.get({name: tuningJobName});

  const content = 'Why lava is red?';

  const response = await client.models.generateContent({
    model: tuningJob.tunedModel.endpoint,
    content: content,
  });

  console.log(response.text);
  // Example response:
  //  The lava is red because ...
  return response.text;
}
// [END googlegenaisdk_tuning_textgen_with_txt]

module.exports = {
  generateContent,
};
