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

async function main(gcsSourceUri) {
  // [START vision_batch_annotate_files_gcs_beta]
  // Imports the Google Cloud client libraries
  const {ImageAnnotatorClient} = require('@google-cloud/vision').v1p4beta1;

  // Creates a client
  const client = new ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // GCS path where the pdf file resides
  // const gcsSourceUri = 'gs://my-bucket/my_pdf.pdf';

  const inputConfig = {
    // Supported mime_types are: 'application/pdf' and 'image/tiff'
    mimeType: 'application/pdf',
    gcsSource: {
      uri: gcsSourceUri,
    },
  };
  const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
  const request = {
    requests: [
      {
        inputConfig: inputConfig,
        features: features,
        // Annotate the first two pages and the last one (max 5 pages)
        // First page starts at 1, and not 0. Last page is -1.
        pages: [1, 2, -1],
      },
    ],
  };

  const [result] = await client.batchAnnotateFiles(request);
  const responses = result.responses[0].responses;

  for (const response of responses) {
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
  // [END vision_batch_annotate_files_gcs_beta]
}

main(...process.argv.slice(2));
