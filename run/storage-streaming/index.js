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

// [START functions_tips_storage_streaming]
// [START run_tips_storage_streaming]
const uuidv4 = require('uuid').v4;
const os = require('os');
const path = require('path');

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const sourceFile = storage.bucket('cloud-devrel-public').file('puppies.jpg');

// TODO(developer): set this to a bucket you own
const TARGET_BUCKET = process.env.FUNCTIONS_BUCKET;

// This function downloads a file from Google Cloud Storage before
// performing operations on it. This is inefficient for large files,
// as the machine *must* be able to fit them into memory.
exports.nonStreamingCall = async (req, res) => {
  const tempPath = path.join(os.tmpdir(), `non-streaming-${uuidv4()}.jpg`);
  await sourceFile.download({ destination: tempPath });

  await storage.bucket(TARGET_BUCKET).upload(tempPath, {
    destination: 'puppies-copy.jpg'
  });

  res.status(200).send('Downloaded copy complete.');
}

// This function performs operations on a file in Google Cloud Storage
// *without* downloading it. This lets you process files that are bigger
// than the instance's available memory.
exports.streamingCall = async (req, res) => {
  const readStream = sourceFile.createReadStream();
  const readPromise = new Promise((resolve, reject) => {
    readStream.on('error', reject).on('end', resolve);
  })

  const targetFile = storage.bucket(TARGET_BUCKET).file('puppies-streaming-copy.jpg');
  const writeStream = targetFile.createWriteStream({ gzip: true });
  const writePromise = new Promise((resolve, reject) => {
    writeStream.on('error', reject).on('finish', resolve);
  })

  readStream.pipe(writeStream);

  await writePromise;

  res.status(200).send('Streaming copy complete.');
}
// [END functions_tips_storage_streaming]
// [END run_tips_storage_streaming]
