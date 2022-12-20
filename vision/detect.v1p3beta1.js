// Copyright 2018 Google LLC
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

async function detectHandwritingOCR(fileName) {
  // [START vision_handwritten_ocr_beta]
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

  const [result] = await client.documentTextDetection(request);
  const fullTextAnnotation = result.fullTextAnnotation;
  console.log(`Full text: ${fullTextAnnotation.text}`);
  // [END vision_handwritten_ocr_beta]
}

async function detectHandwritingGCS(uri) {
  // [START vision_handwritten_ocr_gcs_beta]
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

  const [result] = await client.documentTextDetection(request);
  const fullTextAnnotation = result.fullTextAnnotation;
  console.log(`Full text: ${fullTextAnnotation.text}`);
  // [END vision_handwritten_ocr_gcs_beta]
}

require('yargs')
  .demand(1)
  .command(
    'detectHandwriting',
    'Detects handwriting in a local image file.',
    {},
    opts => detectHandwritingOCR(opts.handwritingSample)
  )
  .command(
    'detectHandwritingGCS',
    'Detects handwriting from Google Cloud Storage Bucket.',
    {},
    opts => detectHandwritingGCS(opts.handwritingSample)
  )
  .options({
    handwritingSample: {
      alias: 'h',
      default: './resources/handwritten.jpg',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    handwritingGcsUri: {
      alias: 'u',
      default: 'gs://cloud-samples-data/vision/handwritten.jpg',
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example('node $0 detectHandwriting ./resources/handwritten.jpg')
  .example('node $0 detectHandwritingGCS gs://my-bucket/image.jpg')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/vision/docs')
  .help()
  .strict().argv;
