// Copyright 2021 Google LLC
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

// [START functions_tips_chunked_download]
// [START cloudrun_tips_chunked_download]
// [START functions_tips_chunked_upload]
// [START cloudrun_tips_chunked_upload]
const uuidv4 = require('uuid').v4;
const Busboy = require('busboy');

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const sourceFile = storage.bucket('cloud-devrel-public').file('data.txt');

// [END functions_tips_chunked_download]
// [END cloudrun_tips_chunked_download]
// TODO(developer): set this to a bucket you own
const {TARGET_BUCKET} = process.env;
// [END functions_tips_chunked_upload]
// [END cloudrun_tips_chunked_upload]
// [START functions_tips_chunked_download]
// [START cloudrun_tips_chunked_download]

// This function downloads a file from Google Cloud Storage with HTTP chunking.
// This allows for sending files that are bigger than the instance's available
// memory.
exports.chunkedDownload = async (req, res) => {
  const readStream = sourceFile.createReadStream();

  // Download file to the end-user's device
  // TODO(developer): remove this to send files (e.g. images) directly to users
  res.attachment('data.txt');

  // Pipe data from the GCS read-stream into the HTTP response body
  readStream.pipe(res);

  return new Promise((resolve, reject) => {
    readStream.on('error', reject).on('finish', resolve);
  });
};

// [END functions_tips_chunked_download]
// [END cloudrun_tips_chunked_download]

// [START functions_tips_chunked_upload]
// [START cloudrun_tips_chunked_upload]

// This function uploads an HTTP-chunked file to Google Cloud Storage.
// This lets you process files that are bigger than the instance's available
// memory.
exports.chunkedUpload = async (req, res) => {
  if (req.method !== 'POST') {
    // Return a "method not allowed" error
    return res.status(405).end();
  }

  // Add an ID to the uploaded filename to prevent filename collisions.
  const fileId = req.query.fileId || uuidv4();

  const busboy = new Busboy({headers: req.headers});

  const ioPromises = [];

  // Wait for incoming files to be received
  busboy.on('file', (_, localFile, fileName) => {
    const idName = `chunked-http-${fileId}-${fileName}`;

    // Create a new file in Cloud Storage (GCS)
    // File will be located at `gs://TARGET_BUCKET/idName`.
    const targetFile = storage.bucket(TARGET_BUCKET).file(idName);
    const writeStream = targetFile.createWriteStream();

    // Pipe file data from the HTTP request to GCS via a writable stream
    localFile.pipe(writeStream);

    // File was processed by Busboy; wait for GCS upload to finish.
    ioPromises.push(
      new Promise((resolve, reject) => {
        localFile.on('end', () => {
          // Signal completion of streaming GCS upload
          writeStream.end();
        });
        writeStream.on('finish', resolve).on('error', reject);
      })
    );
  });

  busboy.end(req.rawBody);

  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the Cloud Storage uploads to complete.
  ioPromises.push(
    new Promise((resolve, reject) =>
      busboy.on('finish', resolve).on('error', reject)
    )
  );

  await Promise.all(ioPromises);

  res.status(200).send(`Chunked upload complete: ${fileId}`);
};
// [END functions_tips_chunked_upload]
// [END cloudrun_tips_chunked_upload]
