// Copyright 2022 Google Inc.
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
// [START retail_import_user_events_from_gcs]

'use strict';

async function main(bucketName) {
  // Imports the Google Cloud client library.
  const {UserEventServiceClient} = require('@google-cloud/retail').v2;

  // Instantiates a client.
  const retailClient = new UserEventServiceClient();

  const projectId = await retailClient.getProjectId();

  //TODO(developer) set the environment variable value which will be used as the bucket name
  const gcsBucket = `gs://${bucketName}`;
  const gcsErrorsBucket = `gs://${bucketName}/error`;
  const gcsEventsObject = 'user_events.json'; // TO CHECK ERROR HANDLING USE THE JSON WITH INVALID USER EVENTS

  // Placement
  const parent = `projects/${projectId}/locations/global/catalogs/default_catalog`; // TO CHECK ERROR HANDLING PASTE THE INVALID CATALOG NAME HERE

  // The desired input location of the data.
  const inputConfig = {
    gcsSource: {
      inputUris: [gcsBucket + '/' + gcsEventsObject],
      dataSchema: 'user_event',
    },
  };

  // The desired location of errors incurred during the Import.
  const errorsConfig = {
    gcsPrefix: gcsErrorsBucket,
  };

  const IResponseParams = {
    IImportUserEventsResponse: 0,
    IImportMetadata: 1,
    IOperation: 2,
  };

  const callImportUserEvents = async () => {
    // Construct request
    const request = {
      parent,
      inputConfig,
      errorsConfig,
    };

    console.log('Import request: ', request);

    // Run request
    const [operation] = await retailClient.importUserEvents(request);
    const response = await operation.promise();
    const result = response[IResponseParams.IImportMetadata];
    console.log(
      `Number of successfully imported events: ${result.successCount | 0}`
    );
    console.log(
      `Number of failures during the importing: ${result.failureCount | 0}`
    );
    console.log(`Operation result: ${JSON.stringify(response)}`);
  };

  console.log('Start events import');
  await callImportUserEvents();
  console.log('Events import finished');
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(
  ...(() => {
    const argv = process.argv.slice(2);
    return argv.length ? argv : [process.env['EVENTS_BUCKET_NAME']];
  })()
);

// [END retail_import_user_events_from_gcs]
