/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START aiplatform_genai_code_model_tuning]
// [START generativeaionvertexai_genai_code_model_tuning]
async function main(
  apiEndpoint,
  project,
  outputDir,
  pipelineJobDisplayName = 'embedding-customization-pipeline-sample',
  baseModelVersionId = 'text-embedding-005',
  taskType = 'DEFAULT',
  corpusPath = 'gs://cloud-samples-data/ai-platform/embedding/goog-10k-2024/r11/corpus.jsonl',
  queriesPath = 'gs://cloud-samples-data/ai-platform/embedding/goog-10k-2024/r11/queries.jsonl',
  trainLabelPath = 'gs://cloud-samples-data/ai-platform/embedding/goog-10k-2024/r11/train.tsv',
  testLabelPath = 'gs://cloud-samples-data/ai-platform/embedding/goog-10k-2024/r11/test.tsv',
  outputDimensionality = 768,
  learningRateMultiplier = 1.0,
  batchSize = 128,
  trainSteps = 1000
) {
  const aiplatform = require('@google-cloud/aiplatform');
  const {PipelineServiceClient} = aiplatform.v1;
  const {helpers} = aiplatform; // helps construct protobuf.Value objects.

  const client = new PipelineServiceClient({apiEndpoint});
  const match = apiEndpoint.match(/(?<L>\w+-\w+)/);
  const location = match ? match.groups.L : 'us-central1';
  const parent = `projects/${project}/locations/${location}`;
  const params = {
    base_model_version_id: baseModelVersionId,
    task_type: taskType,
    queries_path: queriesPath,
    corpus_path: corpusPath,
    train_label_path: trainLabelPath,
    test_label_path: testLabelPath,
    batch_size: batchSize,
    train_steps: trainSteps,
    output_dimensionality: outputDimensionality,
    learning_rate_multiplier: learningRateMultiplier,
  };
  const runtimeConfig = {
    gcsOutputDirectory: outputDir,
    parameterValues: Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, helpers.toValue(v)])
    ),
  };
  const pipelineJob = {
    templateUri:
      'https://us-kfp.pkg.dev/ml-pipeline/llm-text-embedding/tune-text-embedding-model/v1.1.4',
    displayName: pipelineJobDisplayName,
    runtimeConfig,
  };
  async function createTuneJob() {
    const [response] = await client.createPipelineJob({parent, pipelineJob});
    console.log(`job_name: ${response.name}`);
    console.log(`job_state: ${response.state}`);
  }

  await createTuneJob();
}
// [END aiplatform_genai_code_model_tuning]
// [END generativeaionvertexai_genai_code_model_tuning]

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
