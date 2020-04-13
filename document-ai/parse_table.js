/**
 * Copyright 2020, Google, Inc.
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

async function main(
  projectId,
  location,
  gcsInputUri = 'gs://cloud-samples-data/documentai/invoice.pdf'
) {
  // [START documentai_parse_table]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
  // const gcsInputUri = 'YOUR_SOURCE_PDF';

  const {
    DocumentUnderstandingServiceClient,
  } = require('@google-cloud/documentai');
  const client = new DocumentUnderstandingServiceClient();

  async function parseTable() {
    // Configure the request for processing the PDF
    const parent = `projects/${projectId}/locations/${location}`;
    const request = {
      parent,
      inputConfig: {
        gcsSource: {
          uri: gcsInputUri,
        },
        mimeType: 'application/pdf',
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

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument(request);

    // Get all of the document text as one big string
    const {text} = result;

    // Extract shards from the text field
    function getText(textAnchor) {
      // Text anchor has no text segments if cell is empty
      if (textAnchor.textSegments.length > 0) {
        // First shard in document doesn't have startIndex property
        const startIndex = textAnchor.textSegments[0].startIndex || 0;
        const endIndex = textAnchor.textSegments[0].endIndex;

        return text.substring(startIndex, endIndex);
      }
      return '[NO TEXT]';
    }

    // Get the first table in the document
    const [page1] = result.pages;
    const [table] = page1.tables;
    const [headerRow] = table.headerRows;

    console.log('Header row:');
    for (const tableCell of headerRow.cells) {
      if (tableCell.layout.textAnchor.textSegments) {
        // Extract shards from the text field
        // First shard in document doesn't have startIndex property
        const textAnchor = tableCell.layout.textAnchor;

        console.log(`\t${getText(textAnchor)}`);
      }
    }
  }
  // [END documentai_parse_table]
  await parseTable();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
