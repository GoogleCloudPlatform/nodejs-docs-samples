// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  datasetId = 'YOUR_DATASET_ID'
) {
  // [START automl_vision_classification_get_dataset]
  // [START automl_vision_object_detection_get_dataset]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const datasetId = 'YOUR_DATASET_ID';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require('@google-cloud/automl').v1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function getDataset() {
    // Construct request
    const request = {
      name: client.datasetPath(projectId, location, datasetId),
    };

    const [response] = await client.getDataset(request);

    console.log(`Dataset name: ${response.name}`);
    console.log(
      `Dataset id: ${
        response.name.split('/')[response.name.split('/').length - 1]
      }`
    );
    console.log(`Dataset display name: ${response.displayName}`);
    console.log('Dataset create time');
    console.log(`\tseconds ${response.createTime.seconds}`);
    console.log(`\tnanos ${response.createTime.nanos / 1e9}`);
    // [END automl_vision_classification_get_dataset]
    // [END automl_vision_object_detection_get_dataset]
    console.log(
      `Text extraction dataset metadata: ${response.textExtractionDatasetMetadata}`
    );

    console.log(
      `Text sentiment dataset metadata: ${response.textSentimentDatasetMetadata}`
    );

    console.log(
      `Text classification dataset metadata: ${response.textClassificationDatasetMetadata}`
    );

    if (response.translationDatasetMetadata !== undefined) {
      console.log('Translation dataset metadata:');
      console.log(
        `\tSource language code: ${response.translationDatasetMetadata.sourceLanguageCode}`
      );
      console.log(
        `\tTarget language code: ${response.translationDatasetMetadata.targetLanguageCode}`
      );
    }

    // [START automl_vision_classification_get_dataset]
    console.log(
      `Image classification dataset metadata: ${response.imageClassificationDatasetMetadata}`
    );
    // [END automl_vision_classification_get_dataset]

    // [START automl_vision_object_detection_get_dataset]
    console.log(
      `Image object detection dataset metatdata: ${response.imageObjectDetectionDatasetMetatdata}`
    );
    // [START automl_vision_classification_get_dataset]
  }

  getDataset();
  // [END automl_vision_classification_get_dataset]
  // [END automl_vision_object_detection_get_dataset]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
