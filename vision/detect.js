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

async function detectFaces(fileName) {
  // [START vision_face_detection]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  const [result] = await client.faceDetection(fileName);
  const faces = result.faceAnnotations;
  console.log('Faces:');
  faces.forEach((face, i) => {
    console.log(`  Face #${i + 1}:`);
    console.log(`    Joy: ${face.joyLikelihood}`);
    console.log(`    Anger: ${face.angerLikelihood}`);
    console.log(`    Sorrow: ${face.sorrowLikelihood}`);
    console.log(`    Surprise: ${face.surpriseLikelihood}`);
  });
  // [END vision_face_detection]
}

async function detectFacesGCS(bucketName, fileName) {
  // [START vision_face_detection_gcs]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Performs face detection on the gcs file
  const [result] = await client.faceDetection(`gs://${bucketName}/${fileName}`);
  const faces = result.faceAnnotations;
  console.log('Faces:');
  faces.forEach((face, i) => {
    console.log(`  Face #${i + 1}:`);
    console.log(`    Joy: ${face.joyLikelihood}`);
    console.log(`    Anger: ${face.angerLikelihood}`);
    console.log(`    Sorrow: ${face.sorrowLikelihood}`);
    console.log(`    Surprise: ${face.surpriseLikelihood}`);
  });
  // [END vision_face_detection_gcs]
}

async function detectLabels(fileName) {
  // [START vision_label_detection]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs label detection on the local file
  const [result] = await client.labelDetection(fileName);
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
  // [END vision_label_detection]
}

async function detectLabelsGCS(bucketName, fileName) {
  // [START vision_label_detection_gcs]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Performs label detection on the gcs file
  const [result] = await client.labelDetection(
    `gs://${bucketName}/${fileName}`
  );
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
  // [END vision_label_detection_gcs]
}

async function detectLandmarks(fileName) {
  // [START vision_landmark_detection]
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs landmark detection on the local file
  const [result] = await client.landmarkDetection(fileName);
  const landmarks = result.landmarkAnnotations;
  console.log('Landmarks:');
  landmarks.forEach(landmark => console.log(landmark));
  // [END vision_landmark_detection]
}

async function detectLandmarksGCS(bucketName, fileName) {
  // [START vision_landmark_detection_gcs]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Performs landmark detection on the gcs file
  const [result] = await client.landmarkDetection(
    `gs://${bucketName}/${fileName}`
  );
  const landmarks = result.landmarkAnnotations;
  console.log('Landmarks:');
  landmarks.forEach(landmark => console.log(landmark));
  // [END vision_landmark_detection_gcs]
}

async function detectText(fileName) {
  // [START vision_text_detection]
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs text detection on the local file
  const [result] = await client.textDetection(fileName);
  const detections = result.textAnnotations;
  console.log('Text:');
  detections.forEach(text => console.log(text));
  // [END vision_text_detection]
}

async function detectTextGCS(bucketName, fileName) {
  // [START vision_text_detection_gcs]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Performs text detection on the gcs file
  const [result] = await client.textDetection(`gs://${bucketName}/${fileName}`);
  const detections = result.textAnnotations;
  console.log('Text:');
  detections.forEach(text => console.log(text));
  // [END vision_text_detection_gcs]
}

async function detectLogos(fileName) {
  // [START vision_logo_detection]
  const vision = require('@google-cloud/vision');
  const fs = require('fs');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  const imageBuffer = fs.readFileSync(fileName);
  const base64Image = imageBuffer.toString('base64');

  const request = {
    requests: [
      {
        image: {
          content: base64Image,
        },
        features: [
          {
            type: 'LOGO_DETECTION',
          },
        ],
      },
    ],
  };

  // Performs logo detection on the local file
  const [response] = await client.batchAnnotateImages(request);

  response.responses.forEach(res => {
    if (res.logoAnnotations) {
      console.log('Logos:');
      res.logoAnnotations.forEach(logo => console.log(logo));
    }

    if (res.error) {
      console.error(` - Error: ${res.error.message}`);
    }
  });
  // [END vision_logo_detection]
}

async function detectLogosGCS(bucketName, fileName) {
  // [START vision_logo_detection_gcs]
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    requests: [
      {
        image: {
          source: {
            imageUri: `gs://${bucketName}/${fileName}`,
          },
        },
        features: [
          {
            type: 'LOGO_DETECTION',
          },
        ],
      },
    ],
  };

  // Performs logo detection on the gcs file
  const [response] = await client.batchAnnotateImages(request);

  response.responses.forEach(res => {
    if (res.logoAnnotations) {
      console.log('Logos:');
      res.logoAnnotations.forEach(logo => console.log(logo));
    }

    if (res.error) {
      console.error(` - Error: ${res.error.message}`);
    }
  });
  // [END vision_logo_detection_gcs]
}

async function detectProperties(fileName) {
  // [START vision_image_property_detection]
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs property detection on the local file
  const [result] = await client.imageProperties(fileName);
  const colors = result.imagePropertiesAnnotation.dominantColors.colors;
  colors.forEach(color => console.log(color));
  // [END vision_image_property_detection]
}

async function detectPropertiesGCS(bucketName, fileName) {
  // [START vision_image_property_detection_gcs]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Performs property detection on the gcs file
  const [result] = await client.imageProperties(
    `gs://${bucketName}/${fileName}`
  );
  const colors = result.imagePropertiesAnnotation.dominantColors.colors;
  colors.forEach(color => console.log(color));
  // [END vision_image_property_detection_gcs]
}

async function detectSafeSearch(fileName) {
  // [START vision_safe_search_detection]
  const vision = require('@google-cloud/vision');

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

async function detectSafeSearchGCS(bucketName, fileName) {
  // [START vision_safe_search_detection_gcs]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Performs safe search property detection on the remote file
  const [result] = await client.safeSearchDetection(
    `gs://${bucketName}/${fileName}`
  );
  const detections = result.safeSearchAnnotation;
  console.log(`Adult: ${detections.adult}`);
  console.log(`Spoof: ${detections.spoof}`);
  console.log(`Medical: ${detections.medical}`);
  console.log(`Violence: ${detections.violence}`);
  // [END vision_safe_search_detection_gcs]
}

async function detectCropHints(fileName) {
  // [START vision_crop_hint_detection]

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Find crop hints for the local file
  const [result] = await client.cropHints(fileName);
  const cropHints = result.cropHintsAnnotation;
  cropHints.cropHints.forEach((hintBounds, hintIdx) => {
    console.log(`Crop Hint ${hintIdx}:`);
    hintBounds.boundingPoly.vertices.forEach((bound, boundIdx) => {
      console.log(`  Bound ${boundIdx}: (${bound.x}, ${bound.y})`);
    });
  });
  // [END vision_crop_hint_detection]
}

async function detectCropHintsGCS(bucketName, fileName) {
  // [START vision_crop_hint_detection_gcs]

  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Find crop hints for the remote file
  const [result] = await client.cropHints(`gs://${bucketName}/${fileName}`);
  const cropHints = result.cropHintsAnnotation;
  cropHints.cropHints.forEach((hintBounds, hintIdx) => {
    console.log(`Crop Hint ${hintIdx}:`);
    hintBounds.boundingPoly.vertices.forEach((bound, boundIdx) => {
      console.log(`  Bound ${boundIdx}: (${bound.x}, ${bound.y})`);
    });
  });
  // [END vision_crop_hint_detection_gcs]
}

async function detectWeb(fileName) {
  // [START vision_web_detection]

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Detect similar images on the web to a local file
  const [result] = await client.webDetection(fileName);
  const webDetection = result.webDetection;
  if (webDetection.fullMatchingImages.length) {
    console.log(
      `Full matches found: ${webDetection.fullMatchingImages.length}`
    );
    webDetection.fullMatchingImages.forEach(image => {
      console.log(`  URL: ${image.url}`);
      console.log(`  Score: ${image.score}`);
    });
  }

  if (webDetection.partialMatchingImages.length) {
    console.log(
      `Partial matches found: ${webDetection.partialMatchingImages.length}`
    );
    webDetection.partialMatchingImages.forEach(image => {
      console.log(`  URL: ${image.url}`);
      console.log(`  Score: ${image.score}`);
    });
  }

  if (webDetection.webEntities.length) {
    console.log(`Web entities found: ${webDetection.webEntities.length}`);
    webDetection.webEntities.forEach(webEntity => {
      console.log(`  Description: ${webEntity.description}`);
      console.log(`  Score: ${webEntity.score}`);
    });
  }

  if (webDetection.bestGuessLabels.length) {
    console.log(
      `Best guess labels found: ${webDetection.bestGuessLabels.length}`
    );
    webDetection.bestGuessLabels.forEach(label => {
      console.log(`  Label: ${label.label}`);
    });
  }
  // [END vision_web_detection]
}

async function detectWebGCS(bucketName, fileName) {
  // [START vision_web_detection_gcs]

  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Detect similar images on the web to a remote file
  const [result] = await client.webDetection(`gs://${bucketName}/${fileName}`);
  const webDetection = result.webDetection;
  if (webDetection.fullMatchingImages.length) {
    console.log(
      `Full matches found: ${webDetection.fullMatchingImages.length}`
    );
    webDetection.fullMatchingImages.forEach(image => {
      console.log(`  URL: ${image.url}`);
      console.log(`  Score: ${image.score}`);
    });
  }

  if (webDetection.partialMatchingImages.length) {
    console.log(
      `Partial matches found: ${webDetection.partialMatchingImages.length}`
    );
    webDetection.partialMatchingImages.forEach(image => {
      console.log(`  URL: ${image.url}`);
      console.log(`  Score: ${image.score}`);
    });
  }

  if (webDetection.webEntities.length) {
    console.log(`Web entities found: ${webDetection.webEntities.length}`);
    webDetection.webEntities.forEach(webEntity => {
      console.log(`  Description: ${webEntity.description}`);
      console.log(`  Score: ${webEntity.score}`);
    });
  }

  if (webDetection.bestGuessLabels.length) {
    console.log(
      `Best guess labels found: ${webDetection.bestGuessLabels.length}`
    );
    webDetection.bestGuessLabels.forEach(label => {
      console.log(`  Label: ${label.label}`);
    });
  }
  // [END vision_web_detection_gcs]
}

async function detectWebGeo(fileName) {
  // [START vision_web_detection_include_geo]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

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

  // Detect similar images on the web to a local file
  const [result] = await client.webDetection(request);
  const webDetection = result.webDetection;
  webDetection.webEntities.forEach(entity => {
    console.log(`Score: ${entity.score}`);
    console.log(`Description: ${entity.description}`);
  });
  // [END vision_web_detection_include_geo]
}

async function detectWebGeoGCS(bucketName, fileName) {
  // [START vision_web_detection_include_geo_gcs]
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    image: {
      source: {
        imageUri: `gs://${bucketName}/${fileName}`,
      },
    },
    imageContext: {
      webDetectionParams: {
        includeGeoResults: true,
      },
    },
  };

  // Detect similar images on the web to a remote file
  const [result] = await client.webDetection(request);
  const webDetection = result.webDetection;
  webDetection.webEntities.forEach(entity => {
    console.log(`Score: ${entity.score}`);
    console.log(`Description: ${entity.description}`);
  });
  // [END vision_web_detection_include_geo_gcs]
}

async function detectFulltext(fileName) {
  // [START vision_fulltext_detection]

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Read a local image as a text document
  const [result] = await client.documentTextDetection(fileName);
  const fullTextAnnotation = result.fullTextAnnotation;
  console.log(`Full text: ${fullTextAnnotation.text}`);
  fullTextAnnotation.pages.forEach(page => {
    page.blocks.forEach(block => {
      console.log(`Block confidence: ${block.confidence}`);
      block.paragraphs.forEach(paragraph => {
        console.log(`Paragraph confidence: ${paragraph.confidence}`);
        paragraph.words.forEach(word => {
          const wordText = word.symbols.map(s => s.text).join('');
          console.log(`Word text: ${wordText}`);
          console.log(`Word confidence: ${word.confidence}`);
          word.symbols.forEach(symbol => {
            console.log(`Symbol text: ${symbol.text}`);
            console.log(`Symbol confidence: ${symbol.confidence}`);
          });
        });
      });
    });
  });
  // [END vision_fulltext_detection]
}

async function detectFulltextGCS(bucketName, fileName) {
  // [START vision_fulltext_detection_gcs]

  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  // Read a remote image as a text document
  const [result] = await client.documentTextDetection(
    `gs://${bucketName}/${fileName}`
  );
  const fullTextAnnotation = result.fullTextAnnotation;
  console.log(fullTextAnnotation.text);
  // [END vision_fulltext_detection_gcs]
}

async function detectPdfText(bucketName, fileName, outputPrefix) {
  // [START vision_text_detection_pdf_gcs]

  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision').v1;

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // Bucket where the file resides
  // const bucketName = 'my-bucket';
  // Path to PDF file within bucket
  // const fileName = 'path/to/document.pdf';
  // The folder to store the results
  // const outputPrefix = 'results'

  const gcsSourceUri = `gs://${bucketName}/${fileName}`;
  const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

  const inputConfig = {
    // Supported mime_types are: 'application/pdf' and 'image/tiff'
    mimeType: 'application/pdf',
    gcsSource: {
      uri: gcsSourceUri,
    },
  };
  const outputConfig = {
    gcsDestination: {
      uri: gcsDestinationUri,
    },
  };
  const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
  const request = {
    requests: [
      {
        inputConfig: inputConfig,
        features: features,
        outputConfig: outputConfig,
      },
    ],
  };

  const [operation] = await client.asyncBatchAnnotateFiles(request);
  const [filesResponse] = await operation.promise();
  const destinationUri =
    filesResponse.responses[0].outputConfig.gcsDestination.uri;
  console.log('Json saved to: ' + destinationUri);
  // [END vision_text_detection_pdf_gcs]
}

async function localizeObjects(fileName) {
  // [START vision_localize_objects]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');
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

  const [result] = await client.objectLocalization(request);
  const objects = result.localizedObjectAnnotations;
  objects.forEach(object => {
    console.log(`Name: ${object.name}`);
    console.log(`Confidence: ${object.score}`);
    const vertices = object.boundingPoly.normalizedVertices;
    vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
  });
  // [END vision_localize_objects]
}

async function localizeObjectsGCS(gcsUri) {
  // [START vision_localize_objects_gcs]
  // Imports the Google Cloud client libraries
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = `gs://bucket/bucketImage.png`;

  const [result] = await client.objectLocalization(gcsUri);
  const objects = result.localizedObjectAnnotations;
  objects.forEach(object => {
    console.log(`Name: ${object.name}`);
    console.log(`Confidence: ${object.score}`);
    const veritices = object.boundingPoly.normalizedVertices;
    veritices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
  });
  // [END vision_localize_objects_gcs]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    'faces <fileName>',
    'Detects faces in a local image file.',
    {},
    opts => detectFaces(opts.fileName)
  )
  .command(
    'faces-gcs <bucketName> <fileName>',
    'Detects faces in an image in Google Cloud Storage.',
    {},
    opts => detectFacesGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'labels <fileName>',
    'Detects labels in a local image file.',
    {},
    opts => detectLabels(opts.fileName)
  )
  .command(
    'labels-gcs <bucketName> <fileName>',
    'Detects labels in an image in Google Cloud Storage.',
    {},
    opts => detectLabelsGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'landmarks <fileName>',
    'Detects landmarks in a local image file.',
    {},
    opts => detectLandmarks(opts.fileName)
  )
  .command(
    'landmarks-gcs <bucketName> <fileName>',
    'Detects landmarks in an image in Google Cloud Storage.',
    {},
    opts => detectLandmarksGCS(opts.bucketName, opts.fileName)
  )
  .command('text <fileName>', 'Detects text in a local image file.', {}, opts =>
    detectText(opts.fileName)
  )
  .command(
    'text-gcs <bucketName> <fileName>',
    'Detects text in an image in Google Cloud Storage.',
    {},
    opts => detectTextGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'logos <fileName>',
    'Detects logos in a local image file.',
    {},
    opts => detectLogos(opts.fileName)
  )
  .command(
    'logos-gcs <bucketName> <fileName>',
    'Detects logos in an image in Google Cloud Storage.',
    {},
    opts => detectLogosGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'properties <fileName>',
    'Detects image properties in a local image file.',
    {},
    opts => detectProperties(opts.fileName)
  )
  .command(
    'properties-gcs <bucketName> <fileName>',
    'Detects image properties in an image in Google Cloud Storage.',
    {},
    opts => detectPropertiesGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'safe-search <fileName>',
    'Detects safe search properties in a local image file.',
    {},
    opts => detectSafeSearch(opts.fileName)
  )
  .command(
    'safe-search-gcs <bucketName> <fileName>',
    'Detects safe search properties in an image in Google Cloud Storage.',
    {},
    opts => detectSafeSearchGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'crops <fileName>',
    'Detects crop hints in a local image file.',
    {},
    opts => detectCropHints(opts.fileName)
  )
  .command(
    'crops-gcs <bucketName> <fileName>',
    'Detects crop hints in an image in Google Cloud Storage.',
    {},
    opts => detectCropHintsGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'web <fileName>',
    'Finds similar photos on the web for a local image file.',
    {},
    opts => detectWeb(opts.fileName)
  )
  .command(
    'web-gcs <bucketName> <fileName>',
    'Finds similar photos on the web for an image in Google Cloud Storage.',
    {},
    opts => detectWebGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'web-geo <fileName>',
    'Detects web entities with improved results using geographic metadata',
    {},
    opts => detectWebGeo(opts.fileName)
  )
  .command(
    'web-geo-gcs <bucketName> <fileName>',
    'Detects web entities with improved results using geographic metadata',
    {},
    opts => detectWebGeoGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'fulltext <fileName>',
    'Extracts full text from a local image file.',
    {},
    opts => detectFulltext(opts.fileName)
  )
  .command(
    'fulltext-gcs <bucketName> <fileName>',
    'Extracts full text from an image in Google Cloud Storage.',
    {},
    opts => detectFulltextGCS(opts.bucketName, opts.fileName)
  )
  .command(
    'pdf <bucketName> <fileName> <outputPrefix>',
    'Extracts full text from a pdf file',
    {},
    opts => detectPdfText(opts.bucketName, opts.fileName, opts.outputPrefix)
  )
  .command(
    'localize-objects <fileName>',
    'Detects Objects in a local image file',
    {},
    opts => localizeObjects(opts.fileName)
  )
  .command(
    'localize-objects-gcs <gcsUri>',
    'Detects Objects Google Cloud Storage Bucket',
    {},
    opts => localizeObjectsGCS(opts.gcsUri)
  )
  .example('node $0 faces ./resources/face_no_surprise.jpg')
  .example('node $0 faces-gcs my-bucket your-image.jpg')
  .example('node $0 labels ./resources/wakeupcat.jpg')
  .example('node $0 labels-gcs my-bucket your-image.jpg')
  .example('node $0 landmarks ./resources/landmark.jpg')
  .example('node $0 landmarks-gcs my-bucket your-image.jpg')
  .example('node $0 text ./resources/wakeupcat.jpg')
  .example('node $0 text-gcs my-bucket your-image.jpg')
  .example('node $0 logos ./resources/logos.png')
  .example('node $0 logos-gcs my-bucket your-image.jpg.png')
  .example('node $0 properties ./resources/landmark.jpg')
  .example('node $0 properties-gcs my-bucket your-image.jpg')
  .example('node $0 safe-search ./resources/wakeupcat.jpg')
  .example('node $0 safe-search-gcs my-bucket your-image.jpg')
  .example('node $0 crops ./resources/wakeupcat.jpg')
  .example('node $0 crops-gcs my-bucket your-image.jpg')
  .example('node $0 web ./resources/wakeupcat.jpg')
  .example('node $0 web-gcs my-bucket your-image.jpg')
  .example('node $0 web-geo ./resources/city.jpg')
  .example('node $0 web-geo-gcs my-bucket your-image.jpg')
  .example('node $0 fulltext ./resources/wakeupcat.jpg')
  .example('node $0 fulltext-gcs my-bucket your-image.jpg')
  .example('node $0 pdf my-bucket my-pdf.pdf results')
  .example('node $0 localize-objects ./resources/duck_and_truck.jpg')
  .example('node $0 localize-objects-gcs gs://bucket/bucketImage.png')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/vision/docs')
  .help()
  .strict().argv;
