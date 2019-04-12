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

async function main(projectId = 'YOUR_PROJECT_ID') {
  // [START automl_translation_create_dataset]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.AutoMlClient();
  const computeRegion = 'us-central1';
  const datasetName = 'myDataset';
  const source = 'en';
  const target = 'ja';

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // Specify the source and target language.
  const datasetSpec = {
    sourceLanguageCode: source,
    targetLanguageCode: target,
  };

  // Set dataset name and dataset specification.
  const datasetInfo = {
    displayName: datasetName,
    translationDatasetMetadata: datasetSpec,
  };

  // Create a dataset with the dataset specification in the region.
  const [dataset] = await client.createDataset({
    parent: projectLocation,
    dataset: datasetInfo,
  });

  // Display the dataset information
  console.log(`Dataset name: ${dataset.name}`);
  console.log(`Dataset id: ${dataset.name.split(`/`).pop(-1)}`);
  console.log(`Dataset display name: ${dataset.displayName}`);
  console.log(`Dataset example count: ${dataset.exampleCount}`);
  console.log(`Translation dataset specification:`);
  console.log(
    `\tSource language code: ${
      dataset.translationDatasetMetadata.sourceLanguageCode
    }`
  );
  console.log(
    `\tTarget language code: ${
      dataset.translationDatasetMetadata.targetLanguageCode
    }`
  );
  console.log(`Dataset create time:`);
  console.log(`\tseconds: ${dataset.createTime.seconds}`);
  console.log(`\tnanos: ${dataset.createTime.nanos}`);
  // [END automl_translation_create_dataset]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
