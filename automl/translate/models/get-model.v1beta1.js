/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`use strict`;

async function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION',
  modelId = 'YOUR_MODEL'
) {
  // [START automl_translation_get_model]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Get complete detail of the model.
  const [model] = await client.getModel({name: modelFullId});

  // Display the model information.
  console.log(`Model name: ${model.name}`);
  console.log(`Model id: ${model.name.split(`/`).pop(-1)}`);
  console.log(`Model display name: ${model.displayName}`);
  console.log(`Model dataset id: ${model.datasetId}`);
  if (model.modelMetadata === `translationModelMetadata`) {
    console.log(`Translation model metadata:`);
    console.log(`\tBase model: ${model.translationModelMetadata.baseModel}`);
    console.log(
      `\tSource language code: ${
        model.translationModelMetadata.sourceLanguageCode
      }`
    );
    console.log(
      `\tTarget language code: ${
        model.translationModelMetadata.targetLanguageCode
      }`
    );
  } else if (model.modelMetadata === `textClassificationModelMetadata`) {
    console.log(
      `Text classification model metadata: ${
        model.textClassificationModelMetadata
      }`
    );
  } else if (model.modelMetadata === `imageClassificationModelMetadata`) {
    console.log(`Image classification model metadata:`);
    console.log(
      `\tBase model id: ${model.imageClassificationModelMetadata.baseModelId}`
    );
    console.log(
      `\tTrain budget: ${model.imageClassificationModelMetadata.trainBudget}`
    );
    console.log(
      `\tTrain cost: ${model.imageClassificationModelMetadata.trainCost}`
    );
    console.log(
      `\tStop reason: ${model.imageClassificationModelMetadata.stopReason}`
    );
  }
  console.log(`Model create time:`);
  console.log(`\tseconds: ${model.createTime.seconds}`);
  console.log(`\tnanos: ${model.createTime.nanos}`);
  console.log(`Model update time:`);
  console.log(`\tseconds: ${model.updateTime.seconds}`);
  console.log(`\tnanos: ${model.updateTime.nanos}`);
  console.log(`Model deployment state: ${model.deploymentState}`);

  // [END automl_translation_get_model]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
