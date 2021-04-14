/**
 * Copyright 2020 Google LLC
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

const uuid = require('uuid');

async function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'YOUR_PROJECT_LOCATION',
  gcsOutputUri = 'output-bucket',
  gcsOutputUriPrefix = uuid.v4(),
  gcsInputUri = 'gs://cloud-samples-data/documentai/invoice.pdf'
) {
  // [START documentai_batch_parse_form]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
  // const gcsOutputUri = 'YOUR_STORAGE_BUCKET';
  // const gcsOutputUriPrefix = 'YOUR_STORAGE_PREFIX';
  // const gcsInputUri = 'GCS URI of the PDF to process';

  // Imports the Google Cloud client library
  const {
    DocumentUnderstandingServiceClient,
  } = require('@google-cloud/documentai').v1beta2;
  const {Storage} = require('@google-cloud/storage');

  const client = new DocumentUnderstandingServiceClient();
  const storage = new Storage();

  async function parseFormGCS(inputUri, outputUri, outputUriPrefix) {
    const parent = `projects/${projectId}/locations/${location}`;

    // Configure the batch process request.
    const request = {
      inputConfig: {
        gcsSource: {
          uri: inputUri,
        },
        mimeType: 'application/pdf',
      },
      outputConfig: {
        gcsDestination: {
          uri: `${outputUri}/${outputUriPrefix}/`,
        },
        pagesPerShard: 1,
      },
      formExtractionParams: {
        enabled: true,
        keyValuePairHints: [
          {
            key: 'Phone',
            valueTypes: ['PHONE_NUMBER'],
          },
          {
            key: 'Contact',
            valueTypes: ['EMAIL', 'NAME'],
          },
        ],
      },
    };

    // Configure the request for batch process
    const requests = {
      parent,
      requests: [request],
    };

    // Batch process document using a long-running operation.
    // You can wait for now, or get results later.
    const [operation] = await client.batchProcessDocuments(requests);

    // Wait for operation to complete.
    await operation.promise();

    console.log('Document processing complete.');

    // Query Storage bucket for the results file(s).
    const query = {
      prefix: outputUriPrefix,
    };

    console.log('Fetching results ...');

    // List all of the files in the Storage bucket
    const [files] = await storage.bucket(gcsOutputUri).getFiles(query);

    files.forEach(async (fileInfo, index) => {
      // Get the file as a buffer
      const [file] = await fileInfo.download();

      console.log(`Fetched file #${index + 1}:`);

      // Read the results
      const results = JSON.parse(file.toString());

      // Get all of the document text as one big string.
      const {text} = results;

      // Utility to extract text anchors from text field.
      const getText = textAnchor => {
        const startIndex = textAnchor.textSegments[0].startIndex || 0;
        const endIndex = textAnchor.textSegments[0].endIndex;

        return `\t${text.substring(startIndex, endIndex)}`;
      };

      // Process the output
      const [page1] = results.pages;
      const formFields = page1.formFields;

      for (const field of formFields) {
        const fieldName = getText(field.fieldName.textAnchor);
        const fieldValue = getText(field.fieldValue.textAnchor);

        console.log('Extracted key value pair:');
        console.log(`\t(${fieldName}, ${fieldValue})`);
      }
    });
  }
  // [END documentai_batch_parse_form]

  parseFormGCS(gcsInputUri, gcsOutputUri, gcsOutputUriPrefix);
}
main(...process.argv.slice(2));
