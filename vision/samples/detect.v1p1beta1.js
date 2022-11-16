// Copyright 2017 Google LLC
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

async function detectFulltext(fileName) {
  // [START vision_detect_document]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision').v1p1beta1;

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs label detection on the local file
  const [result] = await client.textDetection(fileName);
  const pages = result.fullTextAnnotation.pages;
  pages.forEach(page => {
    page.blocks.forEach(block => {
      const blockWords = [];
      block.paragraphs.forEach(paragraph => {
        paragraph.words.forEach(word => blockWords.push(word));
        console.log(`Paragraph confidence: ${paragraph.confidence}`);
      });

      let blockText = '';
      const blockSymbols = [];
      blockWords.forEach(word => {
        word.symbols.forEach(symbol => blockSymbols.push(symbol));
        let wordText = '';
        word.symbols.forEach(symbol => {
          wordText = wordText + symbol.text;
          console.log(`Symbol text: ${symbol.text}`);
          console.log(`Symbol confidence: ${symbol.confidence}`);
        });
        console.log(`Word text: ${wordText}`);
        console.log(`Word confidence: ${word.confidence}`);
        blockText = blockText + ` ${wordText}`;
      });

      console.log(`Block text: ${blockText}`);
      console.log(`Block confidence: ${block.confidence}`);
    });
  });
  // [END vision_detect_document]
}

async function detectWebEntitiesIncludingGeoResults(fileName) {
  // [START vision_web_entities_include_geo_results]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision').v1p1beta1;

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  const request = {
    image: {
      source: {
        filename: fileName,
      },
    },
    imageContext: {
      webDetectionParams: {
        includeGeoResults: true,
      },
    },
  };

  // Performs safe search detection on the local file
  const [result] = await client.webDetection(request);
  const webDetection = result.webDetection;
  webDetection.webEntities.forEach(entity => {
    console.log(`Score: ${entity.score}`);
    console.log(`Description: ${entity.description}`);
  });
  // [END vision_web_entities_include_geo_results]
}

//.usage('$0 <command> <local-image-file>', 'Cloud Vision Beta API Samples')
require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    'web-entities-geo <fileName>',
    'Detects web entities with improved results using geographic metadata',
    {},
    opts => detectWebEntitiesIncludingGeoResults(opts.fileName)
  )
  .command(
    'fulltext <fileName>',
    'Extracts full text from an image file including new confidence scores',
    {},
    opts => detectFulltext(opts.fileName)
  )
  .example('node $0 safe-search ./resources/wakeupcat.jpg')
  .example('node $0 web-entities-geo ./resources/city.jpg')
  .example('node $0 web ./resources/wakeupcat.jpg')
  .example('node $0 fulltext ./resources/wakeupcat.jpg')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/vision/docs')
  .help()
  .strict().argv;
