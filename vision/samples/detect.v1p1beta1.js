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

async function detectSafeSearch(fileName) {
  // [START vision_safe_search_detection]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision').v1p1beta1;

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs safe search detection on the local file
  const [result] = await client.safeSearchDetection(fileName);
  const detections = result.safeSearchAnnotation;
  console.log('Safe search:');
  console.log(`Adult: ${detections.adult}`);
  console.log(`Medical: ${detections.medical}`);
  console.log(`Spoof: ${detections.spoof}`);
  console.log(`Violence: ${detections.violence}`);
  console.log(`Racy: ${detections.racy}`);
  // [END vision_safe_search_detection]
}

async function detectWeb(fileName) {
  // [START vision_web_detection]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision').v1p1beta1;

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Detect similar images on the web to a local file
  const [result] = await client.webDetection(fileName);
  const webDetection = result.webDetection;
  if (webDetection.bestGuessLabels.length) {
    webDetection.bestGuessLabels.forEach(label => {
      console.log(`Best guess label: ${label.label}`);
    });
  }

  if (webDetection.pagesWithMatchingImages.length) {
    const pages = webDetection.pagesWithMatchingImages;
    console.log(`Pages with matching images found: ${pages.length}`);

    pages.forEach(page => {
      console.log(`Page url: ${page.url}`);

      if (page.fullMatchingImages.length) {
        const fullMatchingImages = page.fullMatchingImages;
        console.log(`Full Matches found: ${fullMatchingImages.length}`);
        fullMatchingImages.forEach(image => {
          console.log(`Image url: ${image.url}`);
        });
      }

      if (page.partialMatchingImages.length) {
        const partialMatchingImages = page.partialMatchingImages;
        console.log(`Partial Matches found: ${partialMatchingImages.length}`);
        partialMatchingImages.forEach(image => {
          console.log(`Image url: ${image.url}`);
        });
      }
    });
  }

  if (webDetection.fullMatchingImages.length) {
    console.log(
      `Full matches found: ${webDetection.fullMatchingImages.length}`
    );
    webDetection.fullMatchingImages.forEach(image => {
      console.log(`  Image url: ${image.url}`);
    });
  }

  if (webDetection.partialMatchingImages.length) {
    console.log(
      `Partial matches found: ${webDetection.partialMatchingImages.length}`
    );
    webDetection.partialMatchingImages.forEach(image => {
      console.log(`  Image url: ${image.url}`);
    });
  }

  if (webDetection.webEntities.length) {
    console.log(`Web entities found: ${webDetection.webEntities.length}`);
    webDetection.webEntities.forEach(webEntity => {
      console.log(`  Score: ${webEntity.score}`);
      console.log(`  Description: ${webEntity.description}`);
    });
  }

  if (webDetection.visuallySimilarImages.length) {
    const visuallySimilarImages = webDetection.visuallySimilarImages;
    console.log(
      `Visually similar images found: ${visuallySimilarImages.length}`
    );
    visuallySimilarImages.forEach(image => {
      console.log(`  Image url: ${image.url}`);
    });
  }
  // [END vision_web_detection]
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
    'safe-search <fileName>',
    'Detects safe search properties including additional racy category',
    {},
    opts => detectSafeSearch(opts.fileName)
  )
  .command(
    'web <fileName>',
    'Detects web entities including new best guess labels describing content',
    {},
    opts => detectWeb(opts.fileName)
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
