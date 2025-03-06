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
//  title: De-identify the table using two separate cryptographic hash transformations.
//  description: Uses the Data Loss Prevention API to de-identify the table using two separate cryptographic hash transformations.
//  usage: node deIdentifyTableWithMultipleCryptoHash projectId, transientKey, transientKey2
function main(projectId, transientKey1, transientKey2) {
  // [START dlp_deidentify_table_with_multiple_crypto_hash]
  // Imports the Google Cloud client library
  const DLP = require('@google-cloud/dlp');
  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // Crypto key 1
  // const transientKey1 = 'YOUR_TRANSIENT_CRYPTO_KEY';

  // Crypto key 2
  // const transientKey2 = 'YOUR_TRANSIENT_CRYPTO_KEY_2';

  // The table to de-identify.
  const tableToDeIdentify = {
    headers: [{name: 'userid'}, {name: 'comments'}],
    rows: [
      {
        values: [
          {stringValue: 'user1@example.org'},
          {
            stringValue:
              'my email is user1@example.org and phone is 858-555-0222',
          },
        ],
      },
      {
        values: [
          {stringValue: 'user2@example.org'},
          {
            stringValue:
              'my email is user2@example.org and phone is 858-555-0223',
          },
        ],
      },
      {
        values: [
          {
            stringValue: 'user3@example.org',
          },
          {
            stringValue:
              'my email is user3@example.org and phone is 858-555-0224',
          },
        ],
      },
    ],
  };

  async function deIdentifyTableWithMultipleCryptoHash() {
    // The type of info the inspection will look for.
    const infoTypes = [{name: 'PHONE_NUMBER'}, {name: 'EMAIL_ADDRESS'}];

    // The fields to be de-identified.
    const fieldIds1 = [{name: 'userid'}];

    const fieldIds2 = [{name: 'comments'}];

    // Construct two primitive transformations using two different keys.
    const primitiveTransformation1 = {
      cryptoHashConfig: {
        cryptoKey: {
          transient: {
            name: transientKey1,
          },
        },
      },
    };

    const primitiveTransformation2 = {
      cryptoHashConfig: {
        cryptoKey: {
          transient: {
            name: transientKey2,
          },
        },
      },
    };

    // Construct infoType transformation using transient key 2
    const infoTypeTransformation = {
      primitiveTransformation: primitiveTransformation2,
      infoTypes: infoTypes,
    };

    // Associate each field with transformation defined above.
    const fieldTransformations = [
      {
        fields: fieldIds1,
        primitiveTransformation: primitiveTransformation1,
      },
      {
        fields: fieldIds2,
        infoTypeTransformations: {
          transformations: [infoTypeTransformation],
        },
      },
    ];

    // Use transformation confiugrations and construct de-identify configuration.
    const deidentifyConfig = {
      recordTransformations: {
        fieldTransformations: fieldTransformations,
      },
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: deidentifyConfig,
      inspectConfig: {
        infoTypes: infoTypes,
      },
      item: {
        table: tableToDeIdentify,
      },
    };

    // Send the request and receive response from the service.
    const [response] = await dlp.deidentifyContent(request);

    const deidentifiedTable = response.item.table;

    // Print the results.
    console.log(
      `Deidentified table: ${JSON.stringify(deidentifiedTable, null, 2)}`
    );
  }
  deIdentifyTableWithMultipleCryptoHash();
  // [END dlp_deidentify_table_with_multiple_crypto_hash]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
