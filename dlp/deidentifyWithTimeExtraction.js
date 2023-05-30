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
function main(projectId, string) {
  // [START dlp_deidentify_time_extract]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to de-identify
  // const string = 'My BirthDay is on 9/21/1976';

  async function deidentifyWithTimeExtraction() {
    // Specify the content to be inspected.
    const item = {value: string};

    // Specify transformation to extract a portion of date.
    const primitiveTransformation = {
      timePartConfig: {
        partToExtract: 'YEAR',
      },
    };

    // Construct de-identification request to be sent by client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              primitiveTransformation,
            },
          ],
        },
      },
      item: item,
    };

    // Use the client to send the API request.
    const [response] = await dlp.deidentifyContent(request);
    const deidentifiedItem = response.item;

    // Print results.
    console.log(deidentifiedItem.value);
  }

  deidentifyWithTimeExtraction();
  // [END dlp_deidentify_time_extract]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
