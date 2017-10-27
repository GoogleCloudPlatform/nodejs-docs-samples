/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function deidentifyWithMask(string, maskingCharacter, numberToMask) {
  // [START deidentify_masking]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The string to deidentify
  // const string = 'My SSN is 372819127';

  // (Optional) The maximum number of sensitive characters to mask in a match
  // If omitted from the request or set to 0, the API will mask any matching characters
  // const numberToMask = 5;

  // (Optional) The character to mask matching sensitive data with
  // const maskingCharacter = 'x';

  // Construct deidentification request
  const items = [{type: 'text/plain', value: string}];
  const request = {
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
    items: items,
  };

  // Run deidentification request
  dlp
    .deidentifyContent(request)
    .then(response => {
      const deidentifiedItems = response[0].items;
      console.log(deidentifiedItems[0].value);
    })
    .catch(err => {
      console.log(`Error in deidentifyWithMask: ${err.message || err}`);
    });
  // [END deidentify_masking]
}

function deidentifyWithFpe(string, alphabet, keyName, wrappedKey) {
  // [START deidentify_fpe]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The string to deidentify
  // const string = 'My SSN is 372819127';

  // The set of characters to replace sensitive ones with
  // For more information, see https://cloud.google.com/dlp/docs/reference/rest/v2beta1/content/deidentify#FfxCommonNativeAlphabet
  // const alphabet = 'ALPHA_NUMERIC';

  // The name of the Cloud KMS key used to encrypt ('wrap') the AES-256 key
  // const keyName = 'projects/YOUR_GCLOUD_PROJECT/locations/YOUR_LOCATION/keyRings/YOUR_KEYRING_NAME/cryptoKeys/YOUR_KEY_NAME';

  // The encrypted ('wrapped') AES-256 key to use
  // This key should be encrypted using the Cloud KMS key specified above
  // const wrappedKey = 'YOUR_ENCRYPTED_AES_256_KEY'

  // Construct deidentification request
  const items = [{type: 'text/plain', value: string}];
  const request = {
    deidentifyConfig: {
      infoTypeTransformations: {
        transformations: [
          {
            primitiveTransformation: {
              cryptoReplaceFfxFpeConfig: {
                cryptoKey: {
                  kmsWrapped: {
                    wrappedKey: wrappedKey,
                    cryptoKeyName: keyName,
                  },
                },
                commonAlphabet: alphabet,
              },
            },
          },
        ],
      },
    },
    items: items,
  };

  // Run deidentification request
  dlp
    .deidentifyContent(request)
    .then(response => {
      const deidentifiedItems = response[0].items;
      console.log(deidentifiedItems[0].value);
    })
    .catch(err => {
      console.log(`Error in deidentifyWithFpe: ${err.message || err}`);
    });
  // [END deidentify_fpe]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `mask <string>`,
    `Deidentify sensitive data by masking it with a character.`,
    {
      maskingCharacter: {
        type: 'string',
        alias: 'c',
        default: '',
      },
      numberToMask: {
        type: 'number',
        alias: 'n',
        default: 0,
      },
    },
    opts =>
      deidentifyWithMask(opts.string, opts.maskingCharacter, opts.numberToMask)
  )
  .command(
    `fpe <string> <wrappedKey> <keyName>`,
    `Deidentify sensitive data using Format Preserving Encryption (FPE).`,
    {
      alphabet: {
        type: 'string',
        alias: 'a',
        default: 'ALPHA_NUMERIC',
        choices: [
          'NUMERIC',
          'HEXADECIMAL',
          'UPPER_CASE_ALPHA_NUMERIC',
          'ALPHA_NUMERIC',
        ],
      },
    },
    opts =>
      deidentifyWithFpe(
        opts.string,
        opts.alphabet,
        opts.keyName,
        opts.wrappedKey
      )
  )
  .example(`node $0 mask "My SSN is 372819127"`)
  .example(
    `node $0 fpe "My SSN is 372819127" <YOUR_ENCRYPTED_AES_256_KEY> <YOUR_KEY_NAME>`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
