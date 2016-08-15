// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var Storage = require('@google-cloud/storage');

var readline = require('readline');

function getFileStream (bucketName, fileName) {
  if (!bucketName) {
    throw new Error('Bucket not provided. Make sure you have a ' +
      '"bucket" property in your request');
  }
  if (!fileName) {
    throw new Error('Filename not provided. Make sure you have a ' +
      '"file" property in your request');
  }

  // Instantiate a storage client
  var storage = Storage();
  var bucket = storage.bucket(bucketName);
  return bucket.file(fileName).createReadStream();
}

/**
 * Reads file and responds with the number of words in the file.
 *
 * @example
 * gcloud alpha functions call wordCount --data '{"bucket":"<your-bucket-name>","file":"sample.txt"}'
 *
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by the user.
 * @param {Object} data.bucket Name of a Cloud Storage bucket.
 * @param {Object} data.file Name of a file in the Cloud Storage bucket.
 */
function wordCount (context, data) {
  try {
    var count = 0;

    // Use the linebyline module to read the stream line by line.
    var lineReader = readline.createInterface({
      input: getFileStream(data.bucket, data.file)
    });

    lineReader.on('line', function (line) {
      count += line.trim().split(/\s+/).length;
    });

    lineReader.on('close', function () {
      context.success('The file ' + data.file + ' has ' + count + ' words');
    });
  } catch (err) {
    context.failure(err.message);
  }
}

exports.wordCount = wordCount;
