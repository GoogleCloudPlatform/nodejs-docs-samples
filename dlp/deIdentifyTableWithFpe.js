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
//  description: De-identify sensitive data in a string using Format Preserving Encryption (FPE).
//  usage: node deIdentifyTableWithFpe.js my-project alphabet keyName wrappedKey
async function main(projectId, alphabet, keyName, wrappedKey) {
  // [START dlp_deidentify_table_fpe]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The set of characters to replace sensitive ones with
  // For more information, see https://cloud.google.com/dlp/docs/reference/rest/v2/organizations.deidentifyTemplates#ffxcommonnativealphabet
  // const alphabet = 'NUMERIC';

  // The name of the Cloud KMS key used to encrypt ('wrap') the AES-256 key
  // const keyName = 'projects/YOUR_GCLOUD_PROJECT/locations/YOUR_LOCATION/keyRings/YOUR_KEYRING_NAME/cryptoKeys/YOUR_KEY_NAME';

  // The encrypted ('wrapped') AES-256 key to use
  // This key should be encrypted using the Cloud KMS key specified above
  // const wrappedKey = 'YOUR_ENCRYPTED_AES_256_KEY'

  // Table to de-identify
  const tablularData = {
    headers: [{name: 'Employee ID'}, {name: 'Date'}, {name: 'Compensation'}],
    rows: [
      {
        values: [
          {stringValue: '11111'},
          {stringValue: '2015'},
          {stringValue: '$10'},
        ],
      },
      {
        values: [
          {stringValue: '22222'},
          {stringValue: '2016'},
          {stringValue: '$20'},
        ],
      },
      {
        values: [
          {stringValue: '33333'},
          {stringValue: '2016'},
          {stringValue: '$15'},
        ],
      },
    ],
  };

  async function deidentifyTableWithFpe() {
    // Specify field to be encrypted.
    const fieldIds = [{name: 'Employee ID'}];

    // Specify an encrypted AES-256 key and the name of the Cloud KMS key that encrypted it
    const cryptoKeyConfig = {
      kmsWrapped: {
        wrappedKey: wrappedKey,
        cryptoKeyName: keyName,
      },
    };

    // Specify how the content should be encrypted.
    const cryptoReplaceFfxFpeConfig = {
      cryptoKey: cryptoKeyConfig,
      commonAlphabet: alphabet,
    };

    // Associate the encryption with the specified field.
    const fieldTransformations = [
      {
        fields: fieldIds,
        primitiveTransformation: {
          cryptoReplaceFfxFpeConfig,
        },
      },
    ];

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        recordTransformations: {
          fieldTransformations,
        },
      },
      item: {
        table: tablularData,
      },
    };

    // Send the request and receive response from the service.
    const [response] = await dlp.deidentifyContent(request);

    // Print the results.
    console.log(
      `Table after de-identification: ${JSON.stringify(response.item.table)}`
    );
  }
  await deidentifyTableWithFpe();
  // [END dlp_deidentify_table_fpe]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

export default main;
