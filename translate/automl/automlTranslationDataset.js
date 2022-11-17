/**
 * Copyright 2018, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how to perform basic operations on dataset
 * with the Google AutoML Translation API.
 *
 * For more information, see the documentation at
 * https://cloud.google.com/translate/automl/docs
 */

`use strict`;

function createDataset(projectId, computeRegion, datasetName, source, target) {
  // [START automl_translation_create_dataset]
  const automl = require(`@google-cloud/automl`).v1beta1;

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetName = `name of the dataset to create, e.g. “myDataset”`;
  // const source = `source language code, e.g. "en" `;
  // const target = `target language code, e.g. "ja" `;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // Specify the source and target language.
  const datasetSpec = {
    sourceLanguageCode: source,
    targetLanguageCode: target,
  };

  // Set dataset name and dataset specification.
  const dataset = {
    displayName: datasetName,
    translationDatasetMetadata: datasetSpec,
  };

  // Create a dataset with the dataset specification in the region.
  client
    .createDataset({parent: projectLocation, dataset: dataset})
    .then(responses => {
      const dataset = responses[0];

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
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_translation_create_dataset]
}

function listDatasets(projectId, computeRegion, filter) {
  // [START automl_translation_list_datasets]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const filter = `filter expressions, must specify field e.g. “imageClassificationModelMetadata:*”`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // List all the datasets available in the region by applying filter.
  client
    .listDatasets({parent: projectLocation, filter: filter})
    .then(responses => {
      const datasets = responses[0];

      // Display the dataset information.
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
    })
    .catch(err => {
      console.error(err);
    });
  // [START automl_translation_list_datasets]
}

function getDataset(projectId, computeRegion, datasetId) {
  // [START automl_translation_get_dataset]
  const automl = require(`@google-cloud/automl`).v1beta1;

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Get complete detail of the dataset.
  client
    .getDataset({name: datasetFullId})
    .then(responses => {
      const dataset = responses[0];

      // Display the dataset information.
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
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_translation_get_dataset]
}

function importData(projectId, computeRegion, datasetId, path) {
  // [START automl_translation_import_data]
  const automl = require(`@google-cloud/automl`).v1beta1;

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;
  // const path = `string or array of .csv paths in AutoML Vision CSV format, e.g. “gs://myproject/mytraindata.csv”;`

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Get the multiple Google Cloud Storage URIs.
  const inputUris = path.split(`,`);
  const inputConfig = {
    gcsSource: {
      inputUris: inputUris,
    },
  };

  // Import data from the input URI.
  client
    .importData({name: datasetFullId, inputConfig: inputConfig})
    .then(responses => {
      const operation = responses[0];
      console.log(`Processing import...`);
      return operation.promise();
    })
    .then(responses => {
      // The final result of the operation.
      if (responses[2].done === true) {
        console.log(`Data imported.`);
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_translation_import_data]
}

function deleteDataset(projectId, computeRegion, datasetId) {
  // [START automl_translation_delete_dataset]
  const automl = require(`@google-cloud/automl`).v1beta1;

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Delete a dataset.
  client
    .deleteDataset({name: datasetFullId})
    .then(responses => {
      const operation = responses[0];
      return operation.promise();
    })
    .then(responses => {
      // The final result of the operation.
      if (responses[2].done === true) console.log(`Dataset deleted.`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_translation_delete_dataset]
}

require(`yargs`)
  .demand(1)
  .options({
    computeRegion: {
      alias: `c`,
      type: `string`,
      default: process.env.REGION_NAME,
      requiresArg: true,
      description: `region name e.g. "us-central1"`,
    },
    datasetName: {
      alias: `n`,
      type: `string`,
      default: `testDataSet`,
      requiresArg: true,
      description: `Name of the Dataset`,
    },
    datasetId: {
      alias: `i`,
      type: `string`,
      requiresArg: true,
      description: `Id of the dataset`,
    },
    filter: {
      alias: `f`,
      default: `translationDatasetMetadata:*`,
      type: `string`,
      requiresArg: true,
      description: `Name of the Dataset to search for`,
    },
    multilabel: {
      alias: `m`,
      type: `string`,
      default: false,
      requiresArg: true,
      description:
        `Type of the classification problem, ` +
        `False - MULTICLASS, True - MULTILABEL.`,
    },
    outputUri: {
      alias: `o`,
      type: `string`,
      requiresArg: true,
      description: `URI (or local path) to export dataset`,
    },
    path: {
      alias: `p`,
      type: `string`,
      global: true,
      default: `gs://nodejs-docs-samples-vcm/en-ja.csv`,
      requiresArg: true,
      description: `URI or local path to input .csv, or array of .csv paths`,
    },
    projectId: {
      alias: `z`,
      type: `number`,
      default: process.env.GCLOUD_PROJECT,
      requiresArg: true,
      description: `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`,
    },
    source: {
      alias: `s`,
      type: `string`,
      requiresArg: true,
      description: `The source language to be translated from`,
    },
    target: {
      alias: `t`,
      type: `string`,
      requiresArg: true,
      description: `The target language to be translated to`,
    },
  })
  .command(`createDataset`, `creates a new Dataset`, {}, opts =>
    createDataset(
      opts.projectId,
      opts.computeRegion,
      opts.datasetName,
      opts.source,
      opts.target
    )
  )
  .command(`list-datasets`, `list all Datasets`, {}, opts =>
    listDatasets(opts.projectId, opts.computeRegion, opts.filter)
  )
  .command(`get-dataset`, `Get a Dataset`, {}, opts =>
    getDataset(opts.projectId, opts.computeRegion, opts.datasetId)
  )
  .command(`delete-dataset`, `Delete a dataset`, {}, opts =>
    deleteDataset(opts.projectId, opts.computeRegion, opts.datasetId)
  )
  .command(`import-data`, `Import labeled items into dataset`, {}, opts =>
    importData(opts.projectId, opts.computeRegion, opts.datasetId, opts.path)
  )
  .example(`node $0 create-dataset -n "newDataSet" -s "en" -t "ja"`)
  .example(`node $0 list-datasets -f "translationDatasetMetadata:*"`)
  .example(`node $0 get-dataset -i "DATASETID"`)
  .example(`node $0 delete-dataset -i "DATASETID"`)
  .example(
    `node $0 import-data -i "dataSetId" -p "gs://myproject/mytraindata.csv"`
  )
  .wrap(120)
  .recommendCommands()
  .help()
  .strict().argv;
