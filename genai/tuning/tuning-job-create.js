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

// [START googlegenaisdk_tuning_job_create]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let tuningJob = await ai.tunings.tune({
    baseModel: 'gemini-2.5-flash',
    trainingDataset: {
      gcsUri:
        'gs://cloud-samples-data/ai-platform/generative_ai/gemini/text/sft_train_data.jsonl',
    },
    config: {
      tunedModelDisplayName: 'Example tuning job',
    },
  });
  console.log('Created tuning job:', tuningJob);

  const runningStates = new Set(['JOB_STATE_PENDING', 'JOB_STATE_RUNNING']);

  while (runningStates.has(tuningJob.state)) {
    console.log(`Job state: ${tuningJob.state}`);
    tuningJob = await ai.tunings.get({name: tuningJob.name});
    await sleep(60000);
  }

  console.log(tuningJob.tunedModel.model);
  console.log(tuningJob.tunedModel.endpoint);
  console.log(tuningJob.experiment);

  // Example response:
  //  projects/123456789012/locations/us-central1/models/1234567890@1
  //  projects/123456789012/locations/us-central1/endpoints/123456789012345
  //  projects/123456789012/locations/us-central1/metadataStores/default/contexts/tuning-experiment-2025010112345678

  return tuningJob.name;
}
// [END googlegenaisdk_tuning_job_create]

module.exports = {
  generateContent,
};
