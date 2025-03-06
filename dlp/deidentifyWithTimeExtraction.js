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
//  title: De-identify with time extraction
//  description: De-identify sensitive data in a string by replacing it with a given time config.
//  usage: node deidentifyWithTimeExtraction.js my-project string
function main(projectId) {
  // [START dlp_deidentify_time_extract]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to de-identify
  // const string = 'My BirthDay is on 9/21/1976';

  // Table to de-identify
  const tablularData = {
    headers: [
      {name: 'Name'},
      {name: 'Birth Date'},
      {name: 'Credit Card'},
      {name: 'Register Date'},
    ],
    rows: [
      {
        values: [
          {stringValue: 'Ann'},
          {stringValue: '01/01/1970'},
          {stringValue: '4532908762519852'},
          {stringValue: '07/21/1996'},
        ],
      },
      {
        values: [
          {stringValue: 'James'},
          {stringValue: '03/06/1988'},
          {stringValue: '4301261899725540'},
          {stringValue: '04/09/2001'},
        ],
      },
    ],
  };

  async function deidentifyWithTimeExtraction() {
    // Specify transformation to extract a portion of date.
    const primitiveTransformation = {
      timePartConfig: {
        partToExtract: 'YEAR',
      },
    };

    // Specify which fields the TimePart should apply too
    const dateFields = [{name: 'Birth Date'}, {name: 'Register Date'}];

    // Construct de-identification request to be sent by client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        recordTransformations: {
          fieldTransformations: [
            {
              fields: dateFields,
              primitiveTransformation,
            },
          ],
        },
      },
      item: {
        table: tablularData,
      },
    };

    // Use the client to send the API request.
    const [response] = await dlp.deidentifyContent(request);

    // Print results.
    console.log(
      `Table after de-identification: ${JSON.stringify(response.item.table)}`
    );
  }

  deidentifyWithTimeExtraction();
  // [END dlp_deidentify_time_extract]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
