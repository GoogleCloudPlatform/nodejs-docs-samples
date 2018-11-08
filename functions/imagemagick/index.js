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

// [START functions_imagemagick_setup]
const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');
const path = require('path');
const storage = require('@google-cloud/storage')();
const vision = require('@google-cloud/vision').v1p1beta1;

const client = new vision.ImageAnnotatorClient();
// [END functions_imagemagick_setup]

// [START functions_imagemagick_analyze]
// Blurs uploaded images that are flagged as Adult or Violence.
exports.blurOffensiveImages = (event) => {
  const object = event.data || event; // Node 6: event.data === Node 8+: event

  // Exit if this is a deletion or a deploy event.
  if (object.resourceState === 'not_exists') {
    console.log('This is a deletion event.');
    return;
  } else if (!object.name) {
    console.log('This is a deploy event.');
    return;
  }

  const file = storage.bucket(object.bucket).file(object.name);
  const filePath = `gs://${object.bucket}/${object.name}`;

  // Ignore already-blurred files (to prevent re-invoking this function)
  if (file.name.startsWith('blurred-')) {
    console.log(`The image ${file.name} is already blurred.`);
    return;
  }

  console.log(`Analyzing ${file.name}.`);

  return client.safeSearchDetection(filePath)
    .catch((err) => {
      console.error(`Failed to analyze ${file.name}.`, err);
      return Promise.reject(err);
    })
    .then(([result]) => {
      const detections = result.safeSearchAnnotation;

      if (detections.adult === 'VERY_LIKELY' ||
          detections.violence === 'VERY_LIKELY') {
        console.log(`The image ${file.name} has been detected as inappropriate.`);
        return blurImage(file);
      } else {
        console.log(`The image ${file.name} has been detected as OK.`);
      }
    });
};
// [END functions_imagemagick_analyze]

// [START functions_imagemagick_blur]
// Blurs the given file using ImageMagick.
function blurImage (file) {
  const tempLocalPath = `/tmp/${path.parse(file.name).base}`;

  // Download file from bucket.
  return file.download({ destination: tempLocalPath })
    .catch((err) => {
      console.error('Failed to download file.', err);
      return Promise.reject(err);
    })
    .then(() => {
      console.log(`Image ${file.name} has been downloaded to ${tempLocalPath}.`);

      // Blur the image using ImageMagick.
      return new Promise((resolve, reject) => {
        gm(tempLocalPath).blur(16).write((tempLocalPath), (err, stdout) => {
          if (err) {
            console.error('Failed to blur image.', err);
            reject(err);
          } else {
            resolve(stdout);
          }
        });
      });
    })
    .then(() => {
      console.log(`Image ${file.name} has been blurred.`);

      // Mark result as blurred, to avoid re-triggering this function.
      const newName = `blurred-${file.name}`;

      // Upload the Blurred image back into the bucket.
      return file.bucket.upload(tempLocalPath, { destination: newName })
        .catch((err) => {
          console.error('Failed to upload blurred image.', err);
          return Promise.reject(err);
        });
    })
    .then(() => {
      console.log(`Blurred image has been uploaded to ${file.name}.`);

      // Delete the temporary file.
      return new Promise((resolve, reject) => {
        fs.unlink(tempLocalPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
}
// [END functions_imagemagick_blur]
