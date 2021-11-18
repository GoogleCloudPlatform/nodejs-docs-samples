// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const {Storage} = require('@google-cloud/storage');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const bucketUuid = uuid.v4();
const storage = new Storage();
const bucketName = `speech-${bucketUuid}`;
const bucketPrefix = 'export-transcript-output';

const storageUri = 'gs://cloud-samples-data/speech/commercial_mono.wav';
const outputStorageUri = `gs://${bucketName}/${bucketPrefix}`;
const encoding = 'LINEAR16';
const sampleRateHertz = 8000;
const languageCode = 'en-US';

describe('Speech-to-Text export to Cloud Storage ', () => {
  before('should set up a bucket fixture', async () => {
    await storage
      .createBucket(bucketName, {
        location: 'US',
        storageClass: 'COLDLINE',
      })
      .catch(error => {
        if (error.code !== 409) {
          //if it's not a duplicate bucket error, let the user know
          console.error(error);
        }
      });
  });

  it('should export transcriptions', async () => {
    const stdout = execSync(
      `node export-to-storage.v1p1beta1.js ${storageUri} ${outputStorageUri} ${encoding} ${sampleRateHertz} ${languageCode} ${bucketName} ${bucketPrefix}`
    );
    assert.match(stdout, /Transcription/);
  });

  after('should delete the bucket used for the test', async () => {
    const options = {
      prefix: bucketPrefix,
    };

    const bucket = await storage.bucket(bucketName);
    const [files] = await bucket.getFiles(options);
    const length = files.length;
    if (length > 0) {
      await Promise.all(files.map(file => file.delete()));
    }
  });
});
