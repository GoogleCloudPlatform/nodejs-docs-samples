// Copyright 2019 Google LLC
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

function main(fileName = 'path/to/your/file.pdf') {
  // [START vision_batch_annotate_files]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const fileName = 'path/to/your/file.pdf';

  // Imports the Google Cloud client libraries
  const {ImageAnnotatorClient} = require('@google-cloud/vision').v1;
  const fs = require('fs').promises;

  // Instantiates a client
  const client = new ImageAnnotatorClient();

  // You can send multiple files to be annotated, this sample demonstrates how to do this with
  // one file. If you want to use multiple files, you have to create a request object for each file that you want annotated.
  async function batchAnnotateFiles() {
    // First Specify the input config with the file's path and its type.
    // Supported mime_type: application/pdf, image/tiff, image/gif
    // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#inputconfig
    const inputConfig = {
      mimeType: 'application/pdf',
      content: await fs.readFile(fileName),
    };

    // Set the type of annotation you want to perform on the file
    // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#google.cloud.vision.v1.Feature.Type
    const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];

    // Build the request object for that one file. Note: for additional files you have to create
    // additional file request objects and store them in a list to be used below.
    // Since we are sending a file of type `application/pdf`, we can use the `pages` field to
    // specify which pages to process. The service can process up to 5 pages per document file.
    // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#google.cloud.vision.v1.AnnotateFileRequest
    const fileRequest = {
      inputConfig: inputConfig,
      features: features,
      // Annotate the first two pages and the last one (max 5 pages)
      // First page starts at 1, and not 0. Last page is -1.
      pages: [1, 2, -1],
    };

    // Add each `AnnotateFileRequest` object to the batch request.
    const request = {
      requests: [fileRequest],
    };

    // Make the synchronous batch request.
    const [result] = await client.batchAnnotateFiles(request);

    // Process the results, just get the first result, since only one file was sent in this
    // sample.
    const responses = result.responses[0].responses;

    for (const response of responses) {
      console.log(`Full text: ${response.fullTextAnnotation.text}`);
      for (const page of response.fullTextAnnotation.pages) {
        for (const block of page.blocks) {
          console.log(`Block confidence: ${block.confidence}`);
          for (const paragraph of block.paragraphs) {
            console.log(` Paragraph confidence: ${paragraph.confidence}`);
            for (const word of paragraph.words) {
              const symbol_texts = word.symbols.map(symbol => symbol.text);
              const word_text = symbol_texts.join('');
              console.log(
                `  Word text: ${word_text} (confidence: ${word.confidence})`
              );
              for (const symbol of word.symbols) {
                console.log(
                  `   Symbol: ${symbol.text} (confidence: ${symbol.confidence})`
                );
              }
            }
          }
        }
      }
    }
  }

  batchAnnotateFiles();
  // [END vision_batch_annotate_files]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
