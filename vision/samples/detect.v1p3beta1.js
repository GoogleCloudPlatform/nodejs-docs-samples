/**
 * Copyright 2018, Google,LLC.
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

/* eslint-disable */

'use strict';

function localizeObjects(fileName) {
  // [START vision_localize_objects]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision').v1p3beta1;
  const fs = require('fs');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = `/path/to/localImage.png`;

  const request = {
    image: {content: fs.readFileSync(fileName)},
  };

  client
    .objectLocalization(request)
    .then(results => {
      const objects = results[0].localizedObjectAnnotations;
      objects.forEach(object => {
        console.log(`Name: ${object.name}`);
        console.log(`Confidence: ${object.score}`);
        const veritices = object.boundingPoly.normalizedVertices;
        veritices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_localize_objects]
}

function localizeObjectsGCS(uri) {
  // [START vision_localize_objects_uri]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision').v1p3beta1;

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const uri = `gs://bucket/bucketImage.png`;

  client
    .objectLocalization(uri)
    .then(results => {
      const objects = results[0].localizedObjectAnnotations;
      objects.forEach(object => {
        console.log(`Name: ${object.name}`);
        console.log(`Confidence: ${object.score}`);
        const veritices = object.boundingPoly.normalizedVertices;
        veritices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_localize_objects_uri]
}

function detectHandwritingOCR(fileName) {
  // [START vision_handwritten_ocr]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision').v1p3beta1;
  const fs = require('fs');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = `/path/to/localImage.png`;

  const request = {
    image: {
      content: fs.readFileSync(fileName),
    },
    feature: {
      languageHints: ['en-t-i0-handwrit'],
    },
  };
  client
    .documentTextDetection(request)
    .then(results => {
      const fullTextAnnotation = results[0].fullTextAnnotation;
      console.log(`Full text: ${fullTextAnnotation.text}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_handwritten_ocr]
}

function detectHandwritingGCS(uri) {
  // [START vision_handwritten_ocr_uri]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision').v1p3beta1;
  const fs = require('fs');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const uri = `gs://bucket/bucketImage.png`;

  const request = {
    image: {
      content: fs.readFileSync(uri),
    },
    feature: {
      languageHints: ['en-t-i0-handwrit'],
    },
  };

  client
    .documentTextDetection(request)
    .then(results => {
      const fullTextAnnotation = results[0].fullTextAnnotation;
      console.log(`Full text: ${fullTextAnnotation.text}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END vision_handwritten_ocr_uri]
}

require(`yargs`)
  .demand(1)
  .command(
    `localizeObjects`,
    `Detects Objects in a local image file`,
    {},
    opts => localizeObjects(opts.fileName)
  )
  .command(
    `localizeObjectsGCS`,
    `Detects Objects Google Cloud Storage Bucket`,
    {},
    opts => localizeObjectsGCS(opts.gcsUri)
  )
  .command(
    `detectHandwriting`,
    `Detects handwriting in a local image file.`,
    {},
    opts => detectHandwritingOCR(opts.handwritingSample)
  )
  .command(
    `detectHandwritingGCS`,
    `Detects handwriting from Google Cloud Storage Bucket.`,
    {},
    opts => detectHandwritingGCS(opts.handwritingSample)
  )
  .options({
    fileName: {
      alias: 'f',
      default: `./resources/duck_and_truck.jpg`,
      global: true,
      requiresArg: true,
      type: 'string',
    },
    gcsUri: {
      alias: 'u',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    handwritingSample: {
      alias: 'h',
      default: `./resources/handwritten.jpg`,
      global: true,
      requiresArg: true,
      type: 'string',
    },
    handwritingGcsUri: {
      alias: 'u',
      default: `gs://cloud-samples-data/vision/handwritten.jpg`,
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example(`node $0 localizeObjects -f ./resources/duck_and_truck.jpg`)
  .example(`node $0 localizeObjectsGCS gs://my-bucket/image.jpg`)
  .example(`node $0 detectHandwriting ./resources/handwritten.jpg`)
  .example(`node $0 detectHandwritingGCS gs://my-bucket/image.jpg`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/vision/docs`)
  .help()
  .strict().argv;
