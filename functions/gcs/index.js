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

var gcloud = require('gcloud');
var readline = require('readline');

module.exports = {
  wordCount: function (context, data) {
    var bucketName = data.bucket;
    var fileName = data.file;

    if (!bucketName) {
      return context.failure('Bucket not provided. Make sure you have a ' +
        '"bucket" property in your request');
    }
    if (!fileName) {
      return context.failure('Filename not provided. Make sure you have a ' +
        '"file" property in your request');
    }

    // Create a gcs client.
    var gcs = gcloud.storage();
    var bucket = gcs.bucket(bucketName);
    var file = bucket.file(fileName);
    var count = 0;

    // Use the linebyline module to read the stream line by line.
    var lineReader = readline.createInterface({
      input: file.createReadStream()
    });

    lineReader.on('line', function (line) {
      count += line.trim().split(/\s+/).length;
    });

    lineReader.on('close', function () {
      context.success('The file ' + fileName + ' has ' + count + ' words');
    });
  }
};
