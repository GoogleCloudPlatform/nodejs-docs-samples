/**
 * Copyright 2018, Google, LLC
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

/* eslint-env node, mocha */

const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
const supertest = require('supertest');
const request = supertest(process.env.BASE_URL);
const fs = require('fs');
const storageClient = getStorageClient();
const storageLocation = 'US';
const storageClass = 'MULTI_REGIONAL';
const bucket = storageClient.bucket(process.env.OUTPUT_BUCKET);

describe('Tests that do not require a GCS bucket', function () {
  it('should fail if sampleRateHertz field is invalid.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: -24000,
        languageCode: 'en',
        audioContent: fs.readFileSync('test/speech-recording.b64', 'utf8')
      })
      .expect(400, /INVALID_ARGUMENT: sample_rate_hertz/, done);
  });
  it('should fail if languageCode field is invalid.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 24000,
        languageCode: 'xx',
        audioContent: fs.readFileSync('test/speech-recording.b64', 'utf8')
      })
      .expect(400, /INVALID_ARGUMENT.*Invalid recognition.*bad language code/, done);
  });
  it('should fail if audioContent field is invalid.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 24000,
        languageCode: 'en',
        audioContent: 'invalid-base64-audio-content'
      })
      .expect(400, 'invalid encoding', done);
  });
});

describe('Tests that require a GCS bucket', function () {
  // Create the Google Cloud Storage bucket if it doesn't exist.
  before('Create GCS bucket.', function (done) {
    bucket.exists().then(function (data) {
      const exists = data[0];
      if (!exists) {
        bucket.create({
          location: storageLocation,
          storageClass: storageClass
        }).then(function (data) {
          done();
        }).catch(error => {
          done(error);
        });
      } else {
        done();
      }
    });
  });
  it('should return a successful response.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 24000,
        languageCode: 'en',
        audioContent: fs.readFileSync('test/speech-recording.b64', 'utf8')
      })
      .expect(200)
      .expect(response => {
        const responseBody = JSON.parse(response.text);
        // Write the results to a file so the 'after' hook can use them for cleanup.
        fs.writeFileSync('responseBody.test.json', response.text);
        responseBody.translations.forEach(function (translation) {
          if (translation.error) {
            throw new Error(
              `Partial error in translation to ${translation.languageCode}: ${translation.error}`
            );
          }
        });
      })
      .expect(/"transcription":"this is a test please translate this message"/, done);
  });
  after('Delete created files in the bucket and other test artifacts.', function (done) {
    // Load the response from the successful test.
    const responseBody = JSON.parse(fs.readFileSync('responseBody.test.json'));

    let deletedFiles = [];
    // Delete the files created in the successful test.
    for (let i = 0; i < responseBody.translations.length; i++) {
      if (responseBody.translations[i].gcsPath) {
        deletedFiles.push(bucket.file(responseBody.translations[i].gcsPath).delete());
      }
    }

    Promise.all(deletedFiles).then(() => {
      // Delete the file that stores the response from the successful test.
      fs.unlinkSync('responseBody.test.json');
      done();
    });
  });
});

function getStorageClient () {
  const { Storage } = require('@google-cloud/storage');
  return new Storage({ projectId: googleCloudProject });
}
