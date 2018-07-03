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

function deidentifyWithMask(
  callingProjectId,
  string,
  maskingCharacter,
  numberToMask
) {
  // [START dlp_deidentify_masking]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The string to deidentify
  // const string = 'My SSN is 372819127';

  // (Optional) The maximum number of sensitive characters to mask in a match
  // If omitted from the request or set to 0, the API will mask any matching characters
  // const numberToMask = 5;

  // (Optional) The character to mask matching sensitive data with
  // const maskingCharacter = 'x';

  // Construct deidentification request
  const item = {value: string};
  const request = {
    parent: dlp.projectPath(callingProjectId),
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
  dlp
    .deidentifyContent(request)
    .then(response => {
      const deidentifiedItem = response[0].item;
      console.log(deidentifiedItem.value);
    })
    .catch(err => {
      console.log(`Error in deidentifyWithMask: ${err.message || err}`);
    });
  // [END dlp_deidentify_masking]
}

function deidentifyWithDateShift(
  callingProjectId,
  inputCsvFile,
  outputCsvFile,
  dateFields,
  lowerBoundDays,
  upperBoundDays,
  contextFieldId,
  wrappedKey,
  keyName
) {
  // [START dlp_deidentify_date_shift]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // Import other required libraries
  const fs = require('fs');

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The path to the CSV file to deidentify
  // The first row of the file must specify column names, and all other rows
  // must contain valid values
  // const inputCsvFile = '/path/to/input/file.csv';

  // The path to save the date-shifted CSV file to
  // const outputCsvFile = '/path/to/output/file.csv';

  // The list of (date) fields in the CSV file to date shift
  // const dateFields = [{ name: 'birth_date'}, { name: 'register_date' }];

  // The maximum number of days to shift a date backward
  // const lowerBoundDays = 1;

  // The maximum number of days to shift a date forward
  // const upperBoundDays = 1;

  // (Optional) The column to determine date shift amount based on
  // If this is not specified, a random shift amount will be used for every row
  // If this is specified, then 'wrappedKey' and 'keyName' must also be set
  // const contextFieldId = [{ name: 'user_id' }];

  // (Optional) The name of the Cloud KMS key used to encrypt ('wrap') the AES-256 key
  // If this is specified, then 'wrappedKey' and 'contextFieldId' must also be set
  // const keyName = 'projects/YOUR_GCLOUD_PROJECT/locations/YOUR_LOCATION/keyRings/YOUR_KEYRING_NAME/cryptoKeys/YOUR_KEY_NAME';

  // (Optional) The encrypted ('wrapped') AES-256 key to use when shifting dates
  // This key should be encrypted using the Cloud KMS key specified above
  // If this is specified, then 'keyName' and 'contextFieldId' must also be set
  // const wrappedKey = 'YOUR_ENCRYPTED_AES_256_KEY'

  // Helper function for converting CSV rows to Protobuf types
  const rowToProto = row => {
    const values = row.split(',');
    const convertedValues = values.map(value => {
      if (Date.parse(value)) {
        const date = new Date(value);
        return {
          dateValue: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
          },
        };
      } else {
        // Convert all non-date values to strings
        return {stringValue: value.toString()};
      }
    });
    return {values: convertedValues};
  };

  // Read and parse a CSV file
  const csvLines = fs
    .readFileSync(inputCsvFile)
    .toString()
    .split('\n')
    .filter(line => line.includes(','));
  const csvHeaders = csvLines[0].split(',');
  const csvRows = csvLines.slice(1);

  // Construct the table object
  const tableItem = {
    table: {
      headers: csvHeaders.map(header => {
        return {name: header};
      }),
      rows: csvRows.map(row => rowToProto(row)),
    },
  };

  // Construct DateShiftConfig
  const dateShiftConfig = {
    lowerBoundDays: lowerBoundDays,
    upperBoundDays: upperBoundDays,
  };

  if (contextFieldId && keyName && wrappedKey) {
    dateShiftConfig.context = {name: contextFieldId};
    dateShiftConfig.cryptoKey = {
      kmsWrapped: {
        wrappedKey: wrappedKey,
        cryptoKeyName: keyName,
      },
    };
  } else if (contextFieldId || keyName || wrappedKey) {
    throw new Error(
      'You must set either ALL or NONE of {contextFieldId, keyName, wrappedKey}!'
    );
  }

  // Construct deidentification request
  const request = {
    parent: dlp.projectPath(callingProjectId),
    deidentifyConfig: {
      recordTransformations: {
        fieldTransformations: [
          {
            fields: dateFields,
            primitiveTransformation: {
              dateShiftConfig: dateShiftConfig,
            },
          },
        ],
      },
    },
    item: tableItem,
  };

  // Run deidentification request
  dlp
    .deidentifyContent(request)
    .then(response => {
      const tableRows = response[0].item.table.rows;

      // Write results to a CSV file
      tableRows.forEach((row, rowIndex) => {
        const rowValues = row.values.map(
          value =>
            value.stringValue ||
            `${value.dateValue.month}/${value.dateValue.day}/${
              value.dateValue.year
            }`
        );
        csvLines[rowIndex + 1] = rowValues.join(',');
      });
      csvLines.push('');
      fs.writeFileSync(outputCsvFile, csvLines.join('\n'));

      // Print status
      console.log(`Successfully saved date-shift output to ${outputCsvFile}`);
    })
    .catch(err => {
      console.log(`Error in deidentifyWithDateShift: ${err.message || err}`);
    });
  // [END dlp_deidentify_date_shift]
}

function deidentifyWithFpe(
  callingProjectId,
  string,
  alphabet,
  surrogateType,
  keyName,
  wrappedKey
) {
  // [START dlp_deidentify_fpe]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The string to deidentify
  // const string = 'My SSN is 372819127';

  // The set of characters to replace sensitive ones with
  // For more information, see https://cloud.google.com/dlp/docs/reference/rest/v2/organizations.deidentifyTemplates#ffxcommonnativealphabet
  // const alphabet = 'ALPHA_NUMERIC';

  // The name of the Cloud KMS key used to encrypt ('wrap') the AES-256 key
  // const keyName = 'projects/YOUR_GCLOUD_PROJECT/locations/YOUR_LOCATION/keyRings/YOUR_KEYRING_NAME/cryptoKeys/YOUR_KEY_NAME';

  // The encrypted ('wrapped') AES-256 key to use
  // This key should be encrypted using the Cloud KMS key specified above
  // const wrappedKey = 'YOUR_ENCRYPTED_AES_256_KEY'

  // (Optional) The name of the surrogate custom info type to use
  // Only necessary if you want to reverse the deidentification process
  // Can be essentially any arbitrary string, as long as it doesn't appear
  // in your dataset otherwise.
  // const surrogateType = 'SOME_INFO_TYPE_DEID';

  // Construct FPE config
  const cryptoReplaceFfxFpeConfig = {
    cryptoKey: {
      kmsWrapped: {
        wrappedKey: wrappedKey,
        cryptoKeyName: keyName,
      },
    },
    commonAlphabet: alphabet,
  };
  if (surrogateType) {
    cryptoReplaceFfxFpeConfig.surrogateInfoType = {
      name: surrogateType,
    };
  }

  // Construct deidentification request
  const item = {value: string};
  const request = {
    parent: dlp.projectPath(callingProjectId),
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
  };

  // Run deidentification request
  dlp
    .deidentifyContent(request)
    .then(response => {
      const deidentifiedItem = response[0].item;
      console.log(deidentifiedItem.value);
    })
    .catch(err => {
      console.log(`Error in deidentifyWithFpe: ${err.message || err}`);
    });
  // [END dlp_deidentify_fpe]
}

function reidentifyWithFpe(
  callingProjectId,
  string,
  alphabet,
  surrogateType,
  keyName,
  wrappedKey
) {
  // [START dlp_reidentify_fpe]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The string to reidentify
  // const string = 'My SSN is PHONE_TOKEN(9):#########';

  // The set of characters to replace sensitive ones with
  // For more information, see https://cloud.google.com/dlp/docs/reference/rest/v2/organizations.deidentifyTemplates#ffxcommonnativealphabet
  // const alphabet = 'ALPHA_NUMERIC';

  // The name of the Cloud KMS key used to encrypt ('wrap') the AES-256 key
  // const keyName = 'projects/YOUR_GCLOUD_PROJECT/locations/YOUR_LOCATION/keyRings/YOUR_KEYRING_NAME/cryptoKeys/YOUR_KEY_NAME';

  // The encrypted ('wrapped') AES-256 key to use
  // This key should be encrypted using the Cloud KMS key specified above
  // const wrappedKey = 'YOUR_ENCRYPTED_AES_256_KEY'

  // The name of the surrogate custom info type to use when reidentifying data
  // const surrogateType = 'SOME_INFO_TYPE_DEID';

  // Construct deidentification request
  const item = {value: string};
  const request = {
    parent: dlp.projectPath(callingProjectId),
    reidentifyConfig: {
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
                surrogateInfoType: {
                  name: surrogateType,
                },
              },
            },
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

  // Run reidentification request
  dlp
    .reidentifyContent(request)
    .then(response => {
      const reidentifiedItem = response[0].item;
      console.log(reidentifiedItem.value);
    })
    .catch(err => {
      console.log(`Error in reidentifyWithFpe: ${err.message || err}`);
    });
  // [END dlp_reidentify_fpe]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `deidMask <string>`,
    `Deidentify sensitive data in a string by masking it with a character.`,
    {
      maskingCharacter: {
        type: 'string',
        alias: 'm',
        default: '',
      },
      numberToMask: {
        type: 'number',
        alias: 'n',
        default: 0,
      },
    },
    opts =>
      deidentifyWithMask(
        opts.callingProjectId,
        opts.string,
        opts.maskingCharacter,
        opts.numberToMask
      )
  )
  .command(
    `deidFpe <string> <wrappedKey> <keyName>`,
    `Deidentify sensitive data in a string using Format Preserving Encryption (FPE).`,
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
      surrogateType: {
        type: 'string',
        alias: 's',
        default: '',
      },
    },
    opts =>
      deidentifyWithFpe(
        opts.callingProjectId,
        opts.string,
        opts.alphabet,
        opts.surrogateType,
        opts.keyName,
        opts.wrappedKey
      )
  )
  .command(
    `reidFpe <string> <surrogateType> <wrappedKey> <keyName>`,
    `Reidentify sensitive data in a string using Format Preserving Encryption (FPE).`,
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
      reidentifyWithFpe(
        opts.callingProjectId,
        opts.string,
        opts.alphabet,
        opts.surrogateType,
        opts.keyName,
        opts.wrappedKey
      )
  )
  .command(
    `deidDateShift <inputCsvFile> <outputCsvFile> <lowerBoundDays> <upperBoundDays> [dateFields...]`,
    `Deidentify dates in a CSV file by pseudorandomly shifting them.`,
    {
      contextFieldId: {
        type: 'string',
        alias: 'f',
        default: '',
      },
      wrappedKey: {
        type: 'string',
        alias: 'w',
        default: '',
      },
      keyName: {
        type: 'string',
        alias: 'n',
        default: '',
      },
    },
    opts =>
      deidentifyWithDateShift(
        opts.callingProjectId,
        opts.inputCsvFile,
        opts.outputCsvFile,
        opts.dateFields.map(f => {
          return {name: f};
        }),
        opts.lowerBoundDays,
        opts.upperBoundDays,
        opts.contextFieldId,
        opts.wrappedKey,
        opts.keyName
      )
  )
  .option('c', {
    type: 'string',
    alias: 'callingProjectId',
    default: process.env.GCLOUD_PROJECT || '',
  })
  .example(`node $0 deidMask "My SSN is 372819127"`)
  .example(
    `node $0 deidFpe "My SSN is 372819127" <YOUR_ENCRYPTED_AES_256_KEY> projects/my-project/locations/global/keyrings/my-keyring -s SSN_TOKEN`
  )
  .example(
    `node $0 reidFpe "My SSN is SSN_TOKEN(9):#########" <YOUR_ENCRYPTED_AES_256_KEY> projects/my-project/locations/global/keyrings/my-keyring SSN_TOKEN -a NUMERIC`
  )
  .example(
    `node $0 deidDateShift dates.csv dates-shifted.csv 30 30 birth_date register_date [-w <YOUR_ENCRYPTED_AES_256_KEY> -n projects/my-project/locations/global/keyrings/my-keyring]`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
