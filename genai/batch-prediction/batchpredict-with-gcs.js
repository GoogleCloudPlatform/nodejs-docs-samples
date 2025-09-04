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

// [START googlegenaisdk_batchpredict_with_gcs]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const OUTPUT_URI = 'gs://your-bucket/your-prefix';

async function generateContent(
  outputUri = OUTPUT_URI,
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
    httpOptions: {
      apiVersion: 'v1',
    },
  });

  // See the documentation: https://googleapis.github.io/python-genai/genai.html#genai.batches.Batches.create
  let job = await ai.batches.create({
    // To use a tuned model, set the model param to your tuned model using the following format:
    // model="projects/{PROJECT_ID}/locations/{LOCATION}/models/{MODEL_ID}"
    model: 'gemini-2.5-flash',
    // Source link: https://storage.cloud.google.com/cloud-samples-data/batch/prompt_for_batch_gemini_predict.jsonl
    src: 'gs://cloud-samples-data/batch/prompt_for_batch_gemini_predict.jsonl',
    config: {
      dest: outputUri,
    },
  });

  console.log(`Job name: ${job.name}`);
  console.log(`Job state: ${job.state}`);

  // Example response:
  //  Job name: projects/%PROJECT_ID%/locations/us-central1/batchPredictionJobs/9876453210000000000
  //  Job state: JOB_STATE_PENDING

  const completedStates = new Set([
    'JOB_STATE_SUCCEEDED',
    'JOB_STATE_FAILED',
    'JOB_STATE_CANCELLED',
    'JOB_STATE_PAUSED',
  ]);

  while (completedStates.has(job.state)) {
    await new Promise(resolve => setTimeout(resolve, 30000));
    job = await ai.batches.get({name: job.name});
    console.log(`Job state: ${job.state}`);
  }

  // Example response:
  //  Job state: JOB_STATE_PENDING
  //  Job state: JOB_STATE_RUNNING
  //  Job state: JOB_STATE_RUNNING
  //  ...
  //  Job state: JOB_STATE_SUCCEEDED

  return job.state;
}
// [END googlegenaisdk_batchpredict_with_gcs]

module.exports = {
  generateContent,
};
