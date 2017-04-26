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
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const storage = require('@google-cloud/storage')();
const vision = require('@google-cloud/vision')();
// [END functions_imagemagick_setup]

// [START functions_imagemagick_analyze]
// Blurs uploaded images that are flagged as Adult or Violence.
exports.blurOffensiveImages = (event) => {
  const object = event.data;

  // Exit if this is a deletion or a deploy event.
  if (object.resourceState === 'not_exists') {
    console.log('This is a deletion event.');
    return;
  } else if (!object.name) {
    console.log('This is a deploy event.');
    return;
  }

  const file = storage.bucket(object.bucket).file(object.name);

  console.log(`Analyzing ${file.name}.`);

  return vision.detectSafeSearch(file)
    .catch((err) => {
      console.error(`Failed to analyze ${file.name}.`, err);
      return Promise.reject(err);
    })
    .then(([safeSearch]) => {
      if (safeSearch.adult || safeSearch.violence) {
        console.log(`The image ${file.name} has been detected as inappropriate.`);
        return blurImage(file, safeSearch);
      } else {
        console.log(`The image ${file.name} has been detected as OK.`);
      }
    });
};
// [END functions_imagemagick_analyze]

// [START functions_imagemagick_blur]
// Blurs the given file using ImageMagick.
function blurImage (file) {
  const tempLocalFilename = `/tmp/${path.parse(file.name).base}`;

  // Download file from bucket.
  return file.download({ destination: tempLocalFilename })
    .catch((err) => {
      console.error('Failed to download file.', err);
      return Promise.reject(err);
    })
    .then(() => {
      console.log(`Image ${file.name} has been downloaded to ${tempLocalFilename}.`);

      // Blur the image using ImageMagick.
      return new Promise((resolve, reject) => {
        exec(`convert ${tempLocalFilename} -channel RGBA -blur 0x24 ${tempLocalFilename}`, { stdio: 'ignore' }, (err, stdout) => {
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

      // Upload the Blurred image back into the bucket.
      return file.bucket.upload(tempLocalFilename, { destination: file.name })
        .catch((err) => {
          console.error('Failed to upload blurred image.', err);
          return Promise.reject(err);
        });
    })
    .then(() => {
      console.log(`Blurred image has been uploaded to ${file.name}.`);

      // Delete the temporary file.
      return new Promise((resolve, reject) => {
        fs.unlink(tempLocalFilename, (err) => {
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
