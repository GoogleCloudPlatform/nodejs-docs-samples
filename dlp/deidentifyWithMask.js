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
//  title: Deidentify with Mask
//  description: Deidentify sensitive data in a string by masking it with a character.
//  usage: node deidentifyWithMask.js my-project string maskingCharacter numberToMask

function main(projectId, string, maskingCharacter, numberToMask) {
  // [START dlp_deidentify_masking]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project-id';

  // The string to deidentify
  // const string = 'My SSN is 372819127';

  // (Optional) The maximum number of sensitive characters to mask in a match
  // If omitted from the request or set to 0, the API will mask any matching characters
  // const numberToMask = 5;

  // (Optional) The character to mask matching sensitive data with
  // const maskingCharacter = 'x';

  // Construct deidentification request
  const item = {value: string};

  async function deidentifyWithMask() {
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              primitiveTransformation: {
                characterMaskConfig: {
                  maskingCharacter: maskingCharacter,
                  numberToMask: numberToMask,
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

  deidentifyWithMask();
  // [END dlp_deidentify_masking]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
