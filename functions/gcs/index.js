/**
 * Copyright 2016, Google, Inc.
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

// [START functions_word_count_setup]
const Storage = require('@google-cloud/storage');
const readline = require('readline');

// Instantiates a client
const storage = Storage();
// [END functions_word_count_setup]

function getFileStream (file) {
  if (!file.bucket) {
    throw new Error('Bucket not provided. Make sure you have a "bucket" property in your request');
  }
  if (!file.name) {
    throw new Error('Filename not provided. Make sure you have a "name" property in your request');
  }

  return storage.bucket(file.bucket).file(file.name).createReadStream();
}

// [START functions_word_count_read]
/**
 * Reads file and responds with the number of words in the file.
 *
 * @example
 * gcloud functions call wordCount --data '{"bucket":"YOUR_BUCKET_NAME","name":"sample.txt"}'
 *
 * @param {Object} req Cloud Function request context.
 * @param {object} req.body A Google Cloud Storage File object.
 * @param {string} req.body.bucket Name of a Cloud Storage bucket.
 * @param {string} req.body.name Name of a file in the Cloud Storage bucket.
 * @param {Object} res Cloud Function response context.
 */
exports.wordCount = (req, res) => {
  const file = req.body;

  let count = 0;
  const options = {
    input: getFileStream(file)
  };

  // Use the readline module to read the stream line by line.
  readline.createInterface(options)
    .on('line', (line) => {
      count += line.trim().split(/\s+/).length;
    })
    .on('close', () => {
      res.send(`File ${file.name} has ${count} words`);
    });
};
// [END functions_word_count_read]
