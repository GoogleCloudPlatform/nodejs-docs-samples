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

// [START cloudrun_imageproc_handler_setup]
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const vision = require('@google-cloud/vision');

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const client = new vision.ImageAnnotatorClient();

const {BLURRED_BUCKET_NAME} = process.env;
// [END cloudrun_imageproc_handler_setup]

// [START cloudrun_imageproc_handler_analyze]
// Blurs uploaded images that are flagged as Adult or Violence.
exports.blurOffensiveImages = async event => {
  // This event represents the triggering Cloud Storage object.
  const object = event;

  if (object.bucket === BLURRED_BUCKET_NAME) {
    console.log(
      'Event triggered by the blurred bucket; skip to avoid recursion'
    );
    return;
  }

  const file = storage.bucket(object.bucket).file(object.name);
  const filePath = `gs://${object.bucket}/${object.name}`;

  console.log(`Analyzing ${file.name}.`);

  try {
    const [result] = await client.safeSearchDetection(filePath);
    const detections = result.safeSearchAnnotation || {};

    if (
      // Levels are defined in https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#likelihood
      detections.adult === 'VERY_LIKELY' ||
      detections.violence === 'VERY_LIKELY'
    ) {
      console.log(`Detected ${file.name} as inappropriate.`);
      return blurImage(file, BLURRED_BUCKET_NAME);
    } else {
      console.log(`Detected ${file.name} as OK.`);
    }
  } catch (err) {
    console.error(`Failed to analyze ${file.name}.`, err);
    throw err;
  }
};
// [END cloudrun_imageproc_handler_analyze]

// [START cloudrun_imageproc_handler_blur]
// Blurs the given file using sharp, and uploads it to another bucket.
const blurImage = async (file, blurredBucketName) => {
  const tempLocalPath = `/tmp/${path.parse(file.name).base}`;
  const tempLocalBlurredPath = `/tmp/blurred-${path.parse(file.name).base}`;

  // Download file from bucket.
  try {
    await file.download({destination: tempLocalPath});

    console.log(`Downloaded ${file.name} to ${tempLocalPath}.`);
  } catch (err) {
    throw new Error(`File download failed: ${err}`);
  }

  try {
    await sharp(tempLocalPath).blur(16).toFile(tempLocalBlurredPath);

    console.log(`Blurred image: ${file.name}`);
  } catch (err) {
    console.error('Failed to blur image.', err);
    throw err;
  }

  // Upload result to a different bucket, to avoid re-triggering this function.
  const blurredBucket = storage.bucket(blurredBucketName);

  // Upload the Blurred image back into the bucket.
  const gcsPath = `gs://${blurredBucketName}/${file.name}`;
  try {
    await blurredBucket.upload(tempLocalBlurredPath, {destination: file.name});
    console.log(`Uploaded blurred image to: ${gcsPath}`);
  } catch (err) {
    throw new Error(`Unable to upload blurred image to ${gcsPath}: ${err}`);
  } finally {
    // Delete the temporary file.
    await Promise.allSettled([
      fs.unlink(tempLocalPath),
      fs.unlink(tempLocalBlurredPath),
    ]);
  }
};
// [END cloudrun_imageproc_handler_blur]
