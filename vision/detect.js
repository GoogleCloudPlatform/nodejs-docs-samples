/**
 * Copyright 2017, Google, Inc.
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

function detectFaces (fileName) {
  // [START vision_face_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  vision.faceDetection({ source: { filename: fileName } })
    .then((results) => {
      const faces = results[0].faceAnnotations;

      console.log('Faces:');
      faces.forEach((face, i) => {
        console.log(`  Face #${i + 1}:`);
        console.log(`    Joy: ${face.joyLikelihood}`);
        console.log(`    Anger: ${face.angerLikelihood}`);
        console.log(`    Sorrow: ${face.sorrowLikelihood}`);
        console.log(`    Surprise: ${face.surpriseLikelihood}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_face_detection]
}

function detectFacesGCS (bucketName, fileName) {
  // [START vision_face_detection_gcs]
  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Performs face detection on the gcs file
  vision.faceDetection(request)
    .then((results) => {
      const faces = results[0].faceAnnotations;

      console.log('Faces:');
      faces.forEach((face, i) => {
        console.log(`  Face #${i + 1}:`);
        console.log(`    Joy: ${face.joyLikelihood}`);
        console.log(`    Anger: ${face.angerLikelihood}`);
        console.log(`    Sorrow: ${face.sorrowLikelihood}`);
        console.log(`    Surprise: ${face.surpriseLikelihood}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_face_detection_gcs]
}

function detectLabels (fileName) {
  // [START vision_label_detection]
  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs label detection on the local file
  vision.labelDetection({ source: { filename: fileName } })
    .then((results) => {
      const labels = results[0].labelAnnotations;
      console.log('Labels:');
      labels.forEach((label) => console.log(label));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_label_detection]
}

function detectLabelsGCS (bucketName, fileName) {
  // [START vision_label_detection_gcs]
  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Performs label detection on the gcs file
  vision.labelDetection(request)
    .then((results) => {
      const labels = results[0].labelAnnotations;
      console.log('Labels:');
      labels.forEach((label) => console.log(label));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_label_detection_gcs]
}

function detectLandmarks (fileName) {
  // [START vision_landmark_detection]
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs landmark detection on the local file
  vision.landmarkDetection({ source: {filename: fileName} })
    .then((results) => {
      const landmarks = results[0].landmarkAnnotations;
      console.log('Landmarks:');
      landmarks.forEach((landmark) => console.log(landmark));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_landmark_detection]
}

function detectLandmarksGCS (bucketName, fileName) {
  // [START vision_landmark_detection_gcs]
  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Performs landmark detection on the gcs file
  vision.landmarkDetection(request)
    .then((results) => {
      const landmarks = results[0].landmarkAnnotations;
      console.log('Landmarks:');
      landmarks.forEach((landmark) => console.log(landmark));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_landmark_detection_gcs]
}

function detectText (fileName) {
  // [START vision_text_detection]
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs text detection on the local file
  vision.textDetection({ source: { filename: fileName } })
    .then((results) => {
      const detections = results[0].textAnnotations;
      console.log('Text:');
      detections.forEach((text) => console.log(text));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_text_detection]
}

function detectTextGCS (bucketName, fileName) {
  // [START vision_text_detection_gcs]
  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Performs text detection on the gcs file
  vision.textDetection(request)
    .then((results) => {
      const detections = results[0].textAnnotations;
      console.log('Text:');
      detections.forEach((text) => console.log(text));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_text_detection_gcs]
}

function detectLogos (fileName) {
  // [START vision_logo_detection]
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs logo detection on the local file
  vision.logoDetection({ source: { filename: fileName } })
    .then((results) => {
      const logos = results[0].logoAnnotations;
      console.log('Logos:');
      logos.forEach((logo) => console.log(logo));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_logo_detection]
}

function detectLogosGCS (bucketName, fileName) {
  // [START vision_logo_detection_gcs]
  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Performs logo detection on the gcs file
  vision.logoDetection(request)
    .then((results) => {
      const logos = results[0].logoAnnotations;
      console.log('Logos:');
      logos.forEach((logo) => console.log(logo));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_logo_detection_gcs]
}

function detectProperties (fileName) {
  // [START vision_image_property_detection]
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs property detection on the local file
  vision.imageProperties({ source: { filename: fileName } })
    .then((results) => {
      const properties = results[0].imagePropertiesAnnotation;
      const colors = properties.dominantColors.colors;
      colors.forEach((color) => console.log(color));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_image_property_detection]
}

function detectPropertiesGCS (bucketName, fileName) {
  // [START vision_image_property_detection_gcs]
  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Performs property detection on the gcs file
  vision.imageProperties(request)
    .then((results) => {
      const properties = results[0].imagePropertiesAnnotation;
      const colors = properties.dominantColors.colors;
      colors.forEach((color) => console.log(color));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_image_property_detection_gcs]
}

function detectSafeSearch (fileName) {
  // [START vision_safe_search_detection]
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs safe search detection on the local file
  vision.safeSearchDetection({ source: { filename: fileName } })
    .then((results) => {
      const detections = results[0].safeSearchAnnotation;

      console.log(`Adult: ${detections.adult}`);
      console.log(`Spoof: ${detections.spoof}`);
      console.log(`Medical: ${detections.medical}`);
      console.log(`Violence: ${detections.violence}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_safe_search_detection]
}

function detectSafeSearchGCS (bucketName, fileName) {
  // [START vision_safe_search_detection_gcs]
  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Performs safe search property detection on the remote file
  vision.safeSearchDetection(request)
    .then((results) => {
      const detections = results[0].safeSearchAnnotation;

      console.log(`Adult: ${detections.adult}`);
      console.log(`Spoof: ${detections.spoof}`);
      console.log(`Medical: ${detections.medical}`);
      console.log(`Violence: ${detections.violence}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_safe_search_detection_gcs]
}

function detectCropHints (fileName) {
  // [START vision_crop_hint_detection]

  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Find crop hints for the local file
  vision.cropHints({ source: { filename: fileName } })
    .then((results) => {
      const cropHints = results[0].cropHintsAnnotation;

      cropHints.cropHints.forEach((hintBounds, hintIdx) => {
        console.log(`Crop Hint ${hintIdx}:`);
        hintBounds.boundingPoly.vertices.forEach((bound, boundIdx) => {
          console.log(`  Bound ${boundIdx}: (${bound.x}, ${bound.y})`);
        });
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_crop_hint_detection]
}

function detectCropHintsGCS (bucketName, fileName) {
  // [START vision_crop_hint_detection_gcs]

  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Find crop hints for the remote file
  vision.cropHints(request)
    .then((results) => {
      const cropHints = results[0].cropHintsAnnotation;

      cropHints.cropHints.forEach((hintBounds, hintIdx) => {
        console.log(`Crop Hint ${hintIdx}:`);
        hintBounds.boundingPoly.vertices.forEach((bound, boundIdx) => {
          console.log(`  Bound ${boundIdx}: (${bound.x}, ${bound.y})`);
        });
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_crop_hint_detection_gcs]
}

function detectWeb (fileName) {
  // [START vision_web_detection]

  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Detect similar images on the web to a local file
  vision.webDetection({ source: { filename: fileName } })
    .then((results) => {
      const webDetection = results[0].webDetection;

      if (webDetection.fullMatchingImages.length) {
        console.log(`Full matches found: ${webDetection.fullMatchingImages.length}`);
        webDetection.fullMatchingImages.forEach((image) => {
          console.log(`  URL: ${image.url}`);
          console.log(`  Score: ${image.score}`);
        });
      }

      if (webDetection.partialMatchingImages.length) {
        console.log(`Partial matches found: ${webDetection.partialMatchingImages.length}`);
        webDetection.partialMatchingImages.forEach((image) => {
          console.log(`  URL: ${image.url}`);
          console.log(`  Score: ${image.score}`);
        });
      }

      if (webDetection.webEntities.length) {
        console.log(`Web entities found: ${webDetection.webEntities.length}`);
        webDetection.webEntities.forEach((webEntity) => {
          console.log(`  Description: ${webEntity.description}`);
          console.log(`  Score: ${webEntity.score}`);
        });
      }
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_web_detection]
}

function detectWebGCS (bucketName, fileName) {
  // [START vision_web_detection_gcs]

  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Detect similar images on the web to a remote file
  vision.webDetection(request)
    .then((results) => {
      const webDetection = results[0].webDetection;

      if (webDetection.fullMatchingImages.length) {
        console.log(`Full matches found: ${webDetection.fullMatchingImages.length}`);
        webDetection.fullMatchingImages.forEach((image) => {
          console.log(`  URL: ${image.url}`);
          console.log(`  Score: ${image.score}`);
        });
      }

      if (webDetection.partialMatchingImages.length) {
        console.log(`Partial matches found: ${webDetection.partialMatchingImages.length}`);
        webDetection.partialMatchingImages.forEach((image) => {
          console.log(`  URL: ${image.url}`);
          console.log(`  Score: ${image.score}`);
        });
      }

      if (webDetection.webEntities.length) {
        console.log(`Web entities found: ${webDetection.webEntities.length}`);
        webDetection.webEntities.forEach((webEntity) => {
          console.log(`  Description: ${webEntity.description}`);
          console.log(`  Score: ${webEntity.score}`);
        });
      }
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_web_detection_gcs]
}

function detectFulltext (fileName) {
  // [START vision_fulltext_detection]

  // Imports the Google Cloud client library
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Read a local image as a text document
  vision.documentTextDetection({ source: { filename: fileName } })
    .then((results) => {
      const fullTextAnnotation = results[0].fullTextAnnotation;
      console.log(fullTextAnnotation.text);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_fulltext_detection]
}

function detectFulltextGCS (bucketName, fileName) {
  // [START vision_fulltext_detection_gcs]

  // Imports the Google Cloud client libraries
  const Vision = require('@google-cloud/vision');

  // Creates a client
  const vision = new Vision();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'Bucket where the file resides, e.g. my-bucket';
  // const fileName = 'Path to file within bucket, e.g. path/to/image.png';

  const request = {
    source: {
      imageUri: `gs://${bucketName}/${fileName}`
    }
  };

  // Read a remote image as a text document
  vision.documentTextDetection(request)
    .then((results) => {
      const fullTextAnnotation = results[0].fullTextAnnotation;
      console.log(fullTextAnnotation.text);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END vision_fulltext_detection_gcs]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `faces <fileName>`,
    `Detects faces in a local image file.`,
    {},
    (opts) => detectFaces(opts.fileName)
  )
  .command(
    `faces-gcs <bucketName> <fileName>`,
    `Detects faces in an image in Google Cloud Storage.`,
    {},
    (opts) => detectFacesGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `labels <fileName>`,
    `Detects labels in a local image file.`,
    {},
    (opts) => detectLabels(opts.fileName)
  )
  .command(
    `labels-gcs <bucketName> <fileName>`,
    `Detects labels in an image in Google Cloud Storage.`,
    {},
    (opts) => detectLabelsGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `landmarks <fileName>`,
    `Detects landmarks in a local image file.`,
    {},
    (opts) => detectLandmarks(opts.fileName)
  )
  .command(
    `landmarks-gcs <bucketName> <fileName>`,
    `Detects landmarks in an image in Google Cloud Storage.`,
    {},
    (opts) => detectLandmarksGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `text <fileName>`,
    `Detects text in a local image file.`,
    {},
    (opts) => detectText(opts.fileName)
  )
  .command(
    `text-gcs <bucketName> <fileName>`,
    `Detects text in an image in Google Cloud Storage.`,
    {},
    (opts) => detectTextGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `logos <fileName>`,
    `Detects logos in a local image file.`,
    {},
    (opts) => detectLogos(opts.fileName)
  )
  .command(
    `logos-gcs <bucketName> <fileName>`,
    `Detects logos in an image in Google Cloud Storage.`,
    {},
    (opts) => detectLogosGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `properties <fileName>`,
    `Detects image properties in a local image file.`,
    {},
    (opts) => detectProperties(opts.fileName)
  )
  .command(
    `properties-gcs <bucketName> <fileName>`,
    `Detects image properties in an image in Google Cloud Storage.`,
    {},
    (opts) => detectPropertiesGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `safe-search <fileName>`,
    `Detects safe search properties in a local image file.`,
    {},
    (opts) => detectSafeSearch(opts.fileName)
  )
  .command(
    `safe-search-gcs <bucketName> <fileName>`,
    `Detects safe search properties in an image in Google Cloud Storage.`,
    {},
    (opts) => detectSafeSearchGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `crops <fileName>`,
    `Detects crop hints in a local image file.`,
    {},
    (opts) => detectCropHints(opts.fileName)
  )
  .command(
    `crops-gcs <bucketName> <fileName>`,
    `Detects crop hints in an image in Google Cloud Storage.`,
    {},
    (opts) => detectCropHintsGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `web <fileName>`,
    `Finds similar photos on the web for a local image file.`,
    {},
    (opts) => detectWeb(opts.fileName)
  )
  .command(
    `web-gcs <bucketName> <fileName>`,
    `Finds similar photos on the web for an image in Google Cloud Storage.`,
    {},
    (opts) => detectWebGCS(opts.bucketName, opts.fileName)
  )
  .command(
    `fulltext <fileName>`,
    `Extracts full text from a local image file.`,
    {},
    (opts) => detectFulltext(opts.fileName)
  )
  .command(
    `fulltext-gcs <bucketName> <fileName>`,
    `Extracts full text from an image in Google Cloud Storage.`,
    {},
    (opts) => detectFulltextGCS(opts.bucketName, opts.fileName)
  )
  .example(`node $0 faces ./resources/face_no_surprise.jpg`)
  .example(`node $0 faces-gcs my-bucket your-image.jpg`)
  .example(`node $0 labels ./resources/wakeupcat.jpg`)
  .example(`node $0 labels-gcs my-bucket your-image.jpg`)
  .example(`node $0 landmarks ./resources/landmark.jpg`)
  .example(`node $0 landmarks-gcs my-bucket your-image.jpg`)
  .example(`node $0 text ./resources/wakeupcat.jpg`)
  .example(`node $0 text-gcs my-bucket your-image.jpg`)
  .example(`node $0 logos ./resources/logos.png`)
  .example(`node $0 logos-gcs my-bucket your-image.jpg.png`)
  .example(`node $0 properties ./resources/landmark.jpg`)
  .example(`node $0 properties-gcs my-bucket your-image.jpg`)
  .example(`node $0 safe-search ./resources/wakeupcat.jpg`)
  .example(`node $0 safe-search-gcs my-bucket your-image.jpg`)
  .example(`node $0 crops ./resources/wakeupcat.jpg`)
  .example(`node $0 crops-gcs my-bucket your-image.jpg`)
  .example(`node $0 web ./resources/wakeupcat.jpg`)
  .example(`node $0 web-gcs my-bucket your-image.jpg`)
  .example(`node $0 fulltext ./resources/wakeupcat.jpg`)
  .example(`node $0 fulltext-gcs my-bucket your-image.jpg`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/vision/docs`)
  .help()
  .strict()
  .argv;
