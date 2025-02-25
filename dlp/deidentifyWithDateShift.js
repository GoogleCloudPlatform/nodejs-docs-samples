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
//  title: Deidentify with Date Shift
//  description: Deidentify dates in a CSV file by pseudorandomly shifting them.
//  usage: node deidentifyWithDateShift.js my-project dates.csv dates-shifted.csv 30 30 birth_date register_date [<YOUR_ENCRYPTED_AES_256_KEY> projects/my-project/locations/global/keyrings/my-keyring]

function main(
  projectId,
  inputCsvFile,
  outputCsvFile,
  dateFields,
  lowerBoundDays,
  upperBoundDays,
  contextFieldId,
  wrappedKey,
  keyName
) {
  dateFields = transformCLI(dateFields);
  // [START dlp_deidentify_date_shift]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // Import other required libraries
  const fs = require('fs');

  // The project ID to run the API call under
  // const projectId = 'my-project';

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

  async function deidentifyWithDateShift() {
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
      parent: `projects/${projectId}/locations/global`,
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
    const [response] = await dlp.deidentifyContent(request);
    const tableRows = response.item.table.rows;

    // Write results to a CSV file
    tableRows.forEach((row, rowIndex) => {
      const rowValues = row.values.map(
        value =>
          value.stringValue ||
          `${value.dateValue.month}/${value.dateValue.day}/${value.dateValue.year}`
      );
      csvLines[rowIndex + 1] = rowValues.join(',');
    });
    csvLines.push('');
    fs.writeFileSync(outputCsvFile, csvLines.join('\n'));

    // Print status
    console.log(`Successfully saved date-shift output to ${outputCsvFile}`);
  }

  deidentifyWithDateShift();
  // [END dlp_deidentify_date_shift]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

function transformCLI(dateFields) {
  return (dateFields = dateFields.split(',').map(type => {
    return {name: type};
  }));
}
