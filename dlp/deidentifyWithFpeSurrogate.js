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
//  title: De-identify with FPE
//  description: De-identify sensitive data in a string using Format Preserving Encryption (FPE) with surrogate.
//  usage: node deidentifyWithFpeSurrogate.js my-project string alphabet infoTypes surrogateType unwrappedKey
function main(
  projectId,
  string,
  alphabet,
  infoTypes,
  surrogateType,
  unwrappedKey
) {
  infoTypes = transformCLI(infoTypes);
  // [START dlp_deidentify_free_text_with_fpe_using_surrogate]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to de-identify
  // const string = 'My phone number is 4359916732';

  // The set of characters to replace sensitive ones with
  // For more information, see https://cloud.google.com/dlp/docs/reference/rest/v2/organizations.deidentifyTemplates#ffxcommonnativealphabet
  // const alphabet = 'NUMERIC';

  // InfoTypes
  // const infoTypes = [{name: 'PHONE_NUMBER'}];

  // Surrogate Type
  // const surrogateType = 'PHONE_TOKEN';

  // The base64-encoded AES-256 key to use
  // const unwrappedKey = 'YWJjZGVmZ2hpamtsbW5vcA==';

  async function deidentifyWithFpeSurrogate() {
    // Specify an unwrapped crypto key.
    unwrappedKey = Buffer.from(unwrappedKey, 'base64');

    // Specify how the info from the inspection should be encrypted.
    const cryptoReplaceFfxFpeConfig = {
      cryptoKey: {
        unwrapped: {
          key: unwrappedKey,
        },
      },
      commonAlphabet: alphabet,
      surrogateInfoType: {name: surrogateType},
    };

    // Construct the inspect configuration.
    const inspectConfig = {
      infoTypes: infoTypes,
      minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.UNLIKELY,
    };

    // Set the text to be de-identified.
    const item = {value: string};

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              primitiveTransformation: {
                cryptoReplaceFfxFpeConfig: cryptoReplaceFfxFpeConfig,
              },
            },
          ],
        },
      },
      item: item,
      inspectConfig: inspectConfig,
    };
    // Run de-identification request
    const [response] = await dlp.deidentifyContent(request);
    const deidentifiedItem = response.item;
    // Print results
    console.log(deidentifiedItem.value);
  }
  deidentifyWithFpeSurrogate();
  // [END dlp_deidentify_free_text_with_fpe_using_surrogate]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

function transformCLI(infoTypes) {
  return infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;
}
