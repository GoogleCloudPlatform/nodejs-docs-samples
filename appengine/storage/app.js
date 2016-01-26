// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

var format = require('util').format;
var express = require('express');
var gcloud = require('gcloud');

var app = express();
app.set('view engine', 'jade');

// [START config]
// Multer is required to process file uploads and make them available via
// req.files.
var multer = require('multer')({
  inMemory: true,
  fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
});

// The following environment variables are set by app.yaml when running on GAE,
// but will need to be manually set when running locally.
// The storage client is used to communicate with Google Cloud Storage
var storage = gcloud.storage({
  projectId: process.env.GCLOUD_PROJECT
});

// A bucket is a container for objects (files).
var bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
// [END config]

// [START form]
// Display a form for uploading files.
app.get('/', function(req, res) {
  res.render('form.jade');
});
// [END form]

// [START process]
// Process the file upload and upload to Google Cloud Storage.
app.post('/upload', multer.single('file'), function(req, res, next) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Create a new blob in the bucket and upload the file data.
  var blob = bucket.file(req.file.originalname);
  var blobStream = blob.createWriteStream();

  blobStream.on('error', function(err) {
    return next(err);
  });

  blobStream.on('finish', function() {
    // The public URL can be used to directly access the file via HTTP.
    var publicUrl = format(
      'https://storage.googleapis.com/%s/%s',
      bucket.name, blob.name);
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.file.buffer);
});
// [END process]

var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address,
    server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
