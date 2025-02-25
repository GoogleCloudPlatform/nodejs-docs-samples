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
//  title: Reidentify with FPE
//  description: Re-identify text data with format-preserving encryption.
//  usage: node reidentifyTextWithFpe.js my-project string alphabet surrogateType keyName wrappedKey
async function main(
  projectId,
  string,
  alphabet,
  keyName,
  wrappedKey,
  surrogateType
) {
  // [START dlp_reidentify_text_fpe]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to reidentify
  // const string = 'My phone number is PHONE_TOKEN(10):9617256398';

  // The set of characters to replace sensitive ones with
  // For more information, see https://cloud.google.com/dlp/docs/reference/rest/v2/organizations.deidentifyTemplates#ffxcommonnativealphabet
  // const alphabet = 'NUMERIC';

  // The name of the Cloud KMS key used to encrypt ('wrap') the AES-256 key
  // const keyName = 'projects/YOUR_GCLOUD_PROJECT/locations/YOUR_LOCATION/keyRings/YOUR_KEYRING_NAME/cryptoKeys/YOUR_KEY_NAME';

  // The encrypted ('wrapped') AES-256 key to use
  // This key should be encrypted using the Cloud KMS key specified above
  // const wrappedKey = 'YOUR_ENCRYPTED_AES_256_KEY'

  // The name of the surrogate custom info type to use when reidentifying data
  // const surrogateType = 'SOME_INFO_TYPE_DEID';

  async function reidentifyTextWithFpe() {
    // Construct deidentification request
    const item = {value: string};

    // Construt Crypto Key Configuration
    const cryptoKeyConfig = {
      kmsWrapped: {
        wrappedKey: wrappedKey,
        cryptoKeyName: keyName,
      },
    };

    // Construct primitive transformation configuration
    const primitiveTransformation = {
      cryptoReplaceFfxFpeConfig: {
        cryptoKey: cryptoKeyConfig,
        commonAlphabet: alphabet,
        surrogateInfoType: {
          name: surrogateType,
        },
      },
    };

    // Combine configurations and construct re-identify request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      reidentifyConfig: {
        infoTypeTransformations: {
          transformations: [
            {
              primitiveTransformation: primitiveTransformation,
            },
          ],
        },
      },
      inspectConfig: {
        customInfoTypes: [
          {
            infoType: {
              name: surrogateType,
            },
            surrogateType: {},
          },
        ],
      },
      item: item,
    };

    // Run re-identification request
    const [response] = await dlp.reidentifyContent(request);
    const reidentifiedItem = response.item;

    // Print results
    console.log(reidentifiedItem.value);
  }
  await reidentifyTextWithFpe();
  // [END dlp_reidentify_text_fpe]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

export default main;
