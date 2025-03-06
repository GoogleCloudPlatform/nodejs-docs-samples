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
//  title: Re-identify content through deterministic encryption
//  description: Re-identify sensitive data in a string using deterministic encryption, which is a reversible cryptographic method.
//  usage: node reidentifyWithFpe.js my-project string keyName wrappedKey surrogateType
async function main(projectId, string, keyName, wrappedKey, surrogateType) {
  // [START dlp_reidentify_deterministic]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to deidentify
  // const string = 'My name is Alicia Abernathy, and my email address is EMAIL_ADDRESS_TOKEN(52):XXXXXX';

  // The name of the Cloud KMS key used to encrypt ('wrap') the AES-256 key
  // const keyName = 'projects/YOUR_GCLOUD_PROJECT/locations/YOUR_LOCATION/keyRings/YOUR_KEYRING_NAME/cryptoKeys/YOUR_KEY_NAME';

  // The encrypted ('wrapped') AES-256 key to use
  // This key should be encrypted using the Cloud KMS key specified above
  // const wrappedKey = 'YOUR_ENCRYPTED_AES_256_KEY'

  // The name of the surrogate custom info type to use
  // Only necessary if you want to reverse the de-identification process
  // Can be essentially any arbitrary string, as long as it doesn't appear
  // in your dataset otherwise.
  // const surrogateType = 'EMAIL_ADDRESS_TOKEN';

  async function reidentifyDeterministic() {
    // Specify an encrypted AES-256 key and the name of the Cloud KMS key that encrypted it
    const cryptoDeterministicEncryption = {
      cryptoKey: {
        kmsWrapped: {
          wrappedKey: wrappedKey,
          cryptoKeyName: keyName,
        },
      },
      surrogateInfoType: {name: surrogateType},
    };

    // Construct custom infotype to match information
    const customInfoTypes = [
      {
        infoType: {
          name: surrogateType,
        },
        surrogateType: {},
      },
    ];

    // Associate the encryption with the infotype transformation.
    const infoTypeTransformations = {
      transformations: [
        {
          infoTypes: [{name: surrogateType}],
          primitiveTransformation: {
            cryptoDeterministicConfig: cryptoDeterministicEncryption,
          },
        },
      ],
    };

    // Construct item to inspect
    const item = {value: string};

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      reidentifyConfig: {
        infoTypeTransformations: infoTypeTransformations,
      },
      inspectConfig: {customInfoTypes},
      item,
    };

    // Run re-identification request
    const [response] = await dlp.reidentifyContent(request);
    const deidentifiedItem = response.item;

    // Print results
    console.log(deidentifiedItem.value);
  }
  await reidentifyDeterministic();
  // [END dlp_reidentify_deterministic]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

module.exports = main;
