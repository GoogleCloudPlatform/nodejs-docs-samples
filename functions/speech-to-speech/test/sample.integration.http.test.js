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

const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
const test = require('ava');
const supertest = require('supertest');
const request = supertest(process.env.BASE_URL);
const fs = require('fs');
const storageClient = getStorageClient();
const storageLocation = 'US';
const storageClass = 'MULTI_REGIONAL';
const bucket = storageClient.bucket(process.env.OUTPUT_BUCKET);

// Create the Google Cloud Storage bucket to run the tests.
// Caution: The 'after' hook deletes the bucket. To prevent deleting user data, the 'before' hook
// fails if the bucket already exists.
test.before(async t => {
  await bucket.create({
    location: storageLocation,
    storageClass: storageClass
  }).then(function (data) {
    // Continue with the tests.
  }).catch(error => {
    throw (error);
  });
});

test.cb('speechTranslate: System test, invalid sample rate hertz', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: -24000,
      languageCode: 'en',
      audioContent: fs.readFileSync('test/speech-recording.b64', 'utf8')
    })
    .expect(400)
    .expect((response) => {
      t.true(response.text.includes('INVALID_ARGUMENT: sample_rate_hertz'));
    })
    .end(t.end);
});

test.cb('speechTranslate: System test, invalid language code', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: 24000,
      languageCode: 'xx',
      audioContent: fs.readFileSync('test/speech-recording.b64', 'utf8')
    })
    .expect(400)
    .expect((response) => {
      t.regex(response.text, /INVALID_ARGUMENT.*Invalid recognition.*bad language code/);
    })
    .end(t.end);
});

test.cb('speechTranslate: System test, invalid audio content', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: 24000,
      languageCode: 'en',
      audioContent: 'invalid-base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'invalid encoding');
    })
    .end(t.end);
});

test.cb('speechTranslate: System test, successful request', t => {
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
      t.is(responseBody.transcription, 'this is a test please translate this message');
      responseBody.translations.forEach(function (translation) {
        if (translation.error) {
          t.fail();
        }
      });
    })
    .end(t.end);
});

test.after(async t => {
  // Load the response from the successful test.
  const responseBody = JSON.parse(fs.readFileSync('responseBody.test.json'));

  // Delete the files created in the successful test.
  for (let i = 0; i < responseBody.translations.length; i++) {
    if (responseBody.translations[i].gcsPath) {
      await bucket.file(responseBody.translations[i].gcsPath).delete();
    }
  }

  // Delete the empty bucket.
  await bucket.delete();

  // Delete the file that stores the response from the successful test.
  fs.unlinkSync('responseBody.test.json');
});

function getStorageClient () {
  const { Storage } = require('@google-cloud/storage');
  return new Storage({ projectId: googleCloudProject });
}
