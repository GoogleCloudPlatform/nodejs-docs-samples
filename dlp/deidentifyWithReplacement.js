// Copyright 2020 Google LLC
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
//  title: Deidentify with Replacement
//  description: Deidentify sensitive data in a string by replacing it with a given replacement string.
//  usage: node deidentifyWithMask.js my-project string replacement

function main(projectId, string, replacement) {
  // [START dlp_deidentify_replace]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to deidentify
  // const string = 'My SSN is 372819127';

  // The string to replace sensitive information with
  // const replacement = "[REDACTED]"

  async function deidentifyWithReplacement() {
    // Construct deidentification request
    const item = {value: string};
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              primitiveTransformation: {
                replaceConfig: {
                  newValue: {
                    stringValue: replacement,
                  },
                },
              },
            },
          ],
        },
      },
      item: item,
    };

    // Run deidentification request
    const [response] = await dlp.deidentifyContent(request);
    const deidentifiedItem = response.item;
    console.log(deidentifiedItem.value);
  }

  deidentifyWithReplacement();
  // [END dlp_deidentify_replace]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
