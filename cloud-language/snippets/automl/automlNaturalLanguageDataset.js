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
 * with the Google AutoML Natural Language API.
 *
 * For more information, see the documentation at
 * https://cloud.google.com/natural-language/automl/docs/
 */

`use strict`;

async function createDataset(
  projectId,
  computeRegion,
  datasetName,
  multilabel
) {
  // [START automl_natural_language_createDataset]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetName = `name of the dataset to create, e.g. “myDataset”`;
  // const multiLabel = `type of the classification problem, e.g “False”, “True” (multilabel)`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // Classification type is assigned based on multilabel value.
  let classificationType = `MULTICLASS`;
  if (multilabel) {
    classificationType = `MULTILABEL`;
  }

  // Set dataset name and metadata.
  const myDataset = {
    displayName: datasetName,
    textClassificationDatasetMetadata: {
      classificationType: classificationType,
    },
  };

  // Create a dataset with the dataset metadata in the region.
  const [dataset] = await client.createDataset({
    parent: projectLocation,
    dataset: myDataset,
  });
  // Display the dataset information.
  console.log(`Dataset name: ${dataset.name}`);
  console.log(`Dataset id: ${dataset.name.split(`/`).pop(-1)}`);
  console.log(`Dataset display name: ${dataset.displayName}`);
  console.log(`Dataset example count: ${dataset.exampleCount}`);
  console.log(`Text classification type:`);
  console.log(
    `\t ${dataset.textClassificationDatasetMetadata.classificationType}`
  );
  console.log(`Dataset create time:`);
  console.log(`\tseconds: ${dataset.createTime.seconds}`);
  console.log(`\tnanos: ${dataset.createTime.nanos}`);
  // [END automl_natural_language_createDataset]
}

async function listDatasets(projectId, computeRegion, filter) {
  // [START automl_natural_language_listDatasets]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const filter_ = `filter expressions, must specify field e.g. “imageClassificationModelMetadata:*”`;

  // A resource that represents a Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // List all the datasets available in the region by applying filter.
  const [datasets] = await client.listDatasets({
    parent: projectLocation,
    filter: filter,
  });
  // Display the dataset information.
  console.log(`List of datasets:`);
  datasets.forEach(dataset => {
    console.log(`Dataset name: ${dataset.name}`);
    console.log(`Dataset id: ${dataset.name.split(`/`).pop(-1)}`);
    console.log(`Dataset display name: ${dataset.displayName}`);
    console.log(`Dataset example count: ${dataset.exampleCount}`);
    console.log(`Text classification type:`);
    console.log(
      `\t ${dataset.textClassificationDatasetMetadata.classificationType}`
    );
    console.log(`Dataset create time: `);
    console.log(`\tseconds: ${dataset.createTime.seconds}`);
    console.log(`\tnanos: ${dataset.createTime.nanos}`);
    console.log(`\n`);
  });
  // [END automl_natural_language_listDatasets]
}

async function getDataset(projectId, computeRegion, datasetId) {
  // [START automl_natural_language_getDataset]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Get complete detail of the dataset.
  const [dataset] = await client.getDataset({name: datasetFullId});
  // Display the dataset information.
  console.log(`Dataset name: ${dataset.name}`);
  console.log(`Dataset id: ${dataset.name.split(`/`).pop(-1)}`);
  console.log(`Dataset display name: ${dataset.displayName}`);
  console.log(`Dataset example count: ${dataset.exampleCount}`);
  console.log(
    `Text classification type: ${
      dataset.textClassificationDatasetMetadata.classificationType
    }`
  );
  console.log(`Dataset create time: `);
  console.log(`\tseconds: ${dataset.createTime.seconds}`);
  console.log(`\tnanos: ${dataset.createTime.nanos}`);
  // [END automl_natural_language_getDataset]
}

async function importData(projectId, computeRegion, datasetId, path) {
  // [START automl_natural_language_importDataset]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

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

  // Import the dataset from the input URI.
  const [operation] = client.importData({
    name: datasetFullId,
    inputConfig: inputConfig,
  });
  console.log(`Processing import...`);
  const response = await operation.promise();
  // The final result of the operation.
  if (response[2].done === true) console.log(`Data imported.`);

  // [END automl_natural_language_importDataset]
}

async function exportData(projectId, computeRegion, datasetId, outputUri) {
  // [START automl_natural_language_exportDataset]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;
  // const outputUri = `Google Cloud Storage URI for the export directory, e.g. “gs://myproject/output”;`

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Set the output URI
  const outputConfig = {
    gcsDestination: {
      outputUriPrefix: outputUri,
    },
  };

  // Export the data to the output URI.
  const [operation] = client.exportData({
    name: datasetFullId,
    outputConfig: outputConfig,
  });
  console.log(`Processing export...`);
  const response = await operation.promise();
  // The final result of the operation.
  if (response[2].done === true) console.log(`Data exported.`);
  // [END automl_natural_language_exportDataset]
}

async function deleteDataset(projectId, computeRegion, datasetId) {
  // [START automl_natural_language_deleteDataset]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Delete a dataset.
  const [operation] = await client.deleteDataset({name: datasetFullId});
  const response = await operation.promise();
  // The final result of the operation.
  if (response[2].done === true) console.log(`Dataset deleted.`);
  // [END automl_natural_language_deleteDataset]
}

async function main() {
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
        default: `text_classification_dataset_metadata:*`,
        type: `string`,
        requiresArg: false,
        description: `filter expression`,
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
        default: `gs://nodejs-docs-samples-vcm/flowerTraindataMini.csv`,
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
    })
    .command(`create-dataset`, `creates a new Dataset`, {}, opts =>
      createDataset(
        opts.projectId,
        opts.computeRegion,
        opts.datasetName,
        opts.multilabel
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
    .command(
      `export-data`,
      `Export a dataset to a Google Cloud Storage Bucket`,
      {},
      opts =>
        exportData(
          opts.projectId,
          opts.computeRegion,
          opts.datasetId,
          opts.outputUri
        )
    )
    .example(`node $0 create-dataset -n "newDataSet"`)
    .example(`node $0 list-datasets -f "imageClassificationDatasetMetadata:*"`)
    .example(`node $0 get-dataset -i "DATASETID"`)
    .example(`node $0 delete-dataset -i "DATASETID"`)
    .example(
      `node $0 import-data -i "dataSetId" -p "gs://myproject/mytraindata.csv"`
    )
    .example(
      `node $0 export-data -i "dataSetId" -o "gs://myproject/outputdestination.csv"`
    )
    .wrap(120)
    .recommendCommands()
    .help()
    .strict().argv;
}

main().catch(console.error);
