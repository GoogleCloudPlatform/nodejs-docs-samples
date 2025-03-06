// Copyright 2023 Google LLC
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

// sample-metadata:
//  title: De-identify sensitive data in a Cloud Storage directory.
//  description: Uses the Data Loss Prevention API To de-identify sensitive data in a Cloud Storage directory.
//  usage: node deIdentifyCloudStorage.js projectId, inputDirectory, tableId, datasetId, outputDirectory, deidentifyTemplateId, structuredDeidentifyTemplateId, imageRedactTemplateId
async function main(
  projectId,
  inputDirectory,
  tableId,
  datasetId,
  outputDirectory,
  deidentifyTemplateId,
  structuredDeidentifyTemplateId,
  imageRedactTemplateId
) {
  // [START dlp_deidentify_cloud_storage]
  // Imports the Google Cloud client library
  import DLP from '@google-cloud/dlp';
  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The Cloud Storage directory that needs to be inspected
  // const inputDirectory = 'your-google-cloud-storage-path';

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The Cloud Storage directory that will be used to store the de-identified files
  // const outputDirectory = 'your-output-directory';

  // The full resource name of the default de-identify template
  // const deidentifyTemplateId = 'your-deidentify-template-id';

  // The full resource name of the de-identify template for structured files
  // const structuredDeidentifyTemplateId = 'your-structured-deidentify-template-id';

  // The full resource name of the image redaction template for images
  // const imageRedactTemplateId = 'your-image-redact-template-id';

  async function deidentifyCloudStorage() {
    // Specify storage configuration that uses file set.
    const storageConfig = {
      cloudStorageOptions: {
        fileSet: {
          url: inputDirectory,
        },
      },
    };

    // Specify the type of info the inspection will look for.
    const infoTypes = [{name: 'PERSON_NAME'}, {name: 'EMAIL_ADDRESS'}];

    // Construct inspect configuration
    const inspectConfig = {
      infoTypes: infoTypes,
      includeQuote: true,
    };

    // Types of files to include for de-identification.
    const fileTypesToTransform = [
      {fileType: 'IMAGE'},
      {fileType: 'CSV'},
      {fileType: 'TEXT_FILE'},
    ];

    // Specify the big query table to store the transformation details.
    const transformationDetailsStorageConfig = {
      table: {
        projectId: projectId,
        tableId: tableId,
        datasetId: datasetId,
      },
    };

    // Specify the de-identify template used for the transformation.
    const transformationConfig = {
      deidentifyTemplate: deidentifyTemplateId,
      structuredDeidentifyTemplate: structuredDeidentifyTemplateId,
      imageRedactTemplate: imageRedactTemplateId,
    };

    // Construct action to de-identify sensitive data.
    const action = {
      deidentify: {
        cloudStorageOutput: outputDirectory,
        transformationConfig: transformationConfig,
        transformationDetailsStorageConfig: transformationDetailsStorageConfig,
        fileTypes: fileTypesToTransform,
      },
    };

    // Construct the inspect job configuration.
    const inspectJobConfig = {
      inspectConfig: inspectConfig,
      storageConfig: storageConfig,
      actions: [action],
    };

    // Construct the job creation request to be sent by the client.
    const createDlpJobRequest = {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: inspectJobConfig,
    };
    // Send the job creation request and process the response.
    const [response] = await dlp.createDlpJob(createDlpJobRequest);
    const jobName = response.name;

    // Waiting for a maximum of 15 minutes for the job to get complete.
    let job;
    let numOfAttempts = 30;
    while (numOfAttempts > 0) {
      // Fetch DLP Job status
      [job] = await dlp.getDlpJob({name: jobName});

      // Check if the job has completed.
      if (job.state === 'DONE') {
        break;
      }
      if (job.state === 'FAILED') {
        console.log('Job Failed, Please check the configuration.');
        return;
      }
      // Sleep for a short duration before checking the job status again.
      await new Promise(resolve => {
        setTimeout(() => resolve(), 30000);
      });
      numOfAttempts -= 1;
    }

    // Print out the results.
    const infoTypeStats = job.inspectDetails.result.infoTypeStats;
    if (infoTypeStats.length > 0) {
      infoTypeStats.forEach(infoTypeStat => {
        console.log(
          `  Found ${infoTypeStat.count} instance(s) of infoType ${infoTypeStat.infoType.name}.`
        );
      });
    } else {
      console.log('No findings.');
    }
  }
  await deidentifyCloudStorage();
  // [END dlp_deidentify_cloud_storage]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

module.exports = main;
