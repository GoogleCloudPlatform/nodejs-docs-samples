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
  computeRegion = 'YOUR_REGION_NAME',
  filter = 'YOUR_FILTER'
) {
  // [START automl_translation_list_datasets]
  const automl = require(`@google-cloud/automl`);
  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const filter = `filter expressions, must specify field e.g. “imageClassificationModelMetadata:*”`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // List all the datasets available in the region by applying filter.
  const [datasets] = await client.listDatasets({
    parent: projectLocation,
    filter: filter,
  });

  // Display the dataset information.
  if (datasets.length === 0) {
    console.log('No datasets found!');
    return;
  }
  console.log(`List of datasets:`);
  datasets.forEach(dataset => {
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
  });
  // [END automl_translation_list_datasets]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
