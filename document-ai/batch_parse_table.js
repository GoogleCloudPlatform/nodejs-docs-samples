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
  // [START documentai_batch_parse_table]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
  // const gcsOutputUri = 'YOUR_STORAGE_BUCKET';
  // const gcsOutputUriPrefix = 'YOUR_STORAGE_PREFIX';
  // const gcsInputUri = 'YOUR_SOURCE_PDF';

  // Imports the Google Cloud client library
  const {
    DocumentUnderstandingServiceClient,
  } = require('@google-cloud/documentai').v1beta2;
  const {Storage} = require('@google-cloud/storage');

  const client = new DocumentUnderstandingServiceClient();
  const storage = new Storage();

  async function parseTableGCS(inputUri, outputUri, outputUriPrefix) {
    const parent = `projects/${projectId}/locations/${location}`;

    // Configure the batch process request.
    const request = {
      //parent,
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
      tableExtractionParams: {
        enabled: true,
        tableBoundHints: [
          {
            boundingBox: {
              normalizedVertices: [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
              ],
            },
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
    // Note: first request to the service takes longer than subsequent
    // requests.
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

      // Get all of the document text as one big string
      const text = results.text;

      // Get the first table in the document
      const [page1] = results.pages;
      const [table] = page1.tables;
      const [headerRow] = table.headerRows;

      console.log('Results from first table processed:');
      console.log(
        `First detected language: ${page1.detectedLanguages[0].languageCode}`
      );

      console.log('Header row:');
      for (const tableCell of headerRow.cells) {
        if (tableCell.layout.textAnchor.textSegments) {
          // Extract shards from the text field
          // First shard in document doesn't have startIndex property
          const startIndex =
            tableCell.layout.textAnchor.textSegments[0].startIndex || 0;
          const endIndex = tableCell.layout.textAnchor.textSegments[0].endIndex;

          console.log(`\t${text.substring(startIndex, endIndex)}`);
        }
      }
    });
  }
  // [END documentai_batch_parse_table]

  parseTableGCS(gcsInputUri, gcsOutputUri, gcsOutputUriPrefix);
}
main(...process.argv.slice(2));
