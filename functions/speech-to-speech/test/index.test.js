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

const supertest = require('supertest');
const request = supertest(process.env.BASE_URL);

describe('Validate encoding field', function () {
  it('should fail if encoding field is missing.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        // encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en',
        audioContent: 'base64-audio-content'
      })
      .expect(400, 'Invalid encoding.', done);
  });
  it('should fail if encoding field is empty.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: '',
        sampleRateHertz: 16000,
        languageCode: 'en',
        audioContent: 'base64-audio-content'
      })
      .expect(400, 'Invalid encoding.', done);
  });
});

describe('Validate sampleRateHertz field', function () {
  it('should fail if sampleRateHertz field is missing.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        // sampleRateHertz: 16000,
        languageCode: 'en',
        audioContent: 'base64-audio-content'
      })
      .expect(400, 'Sample rate hertz must be numeric.', done);
  });
  it('should fail if sampleRateHertz field is empty.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: '',
        languageCode: 'en',
        audioContent: 'base64-audio-content'
      })
      .expect(400, 'Sample rate hertz must be numeric.', done);
  });
  it('should fail if sampleRateHertz field is not numeric.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 'NaN',
        languageCode: 'en',
        audioContent: 'base64-audio-content'
      })
      .expect(400, 'Sample rate hertz must be numeric.', done);
  });
});

describe('Validate languageCode field', function () {
  it('should fail if languageCode field is missing.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        // languageCode: 'en',
        audioContent: 'base64-audio-content'
      })
      .expect(400, 'Invalid language code.', done);
  });
  it('should fail if languageCode field is empty.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: '',
        audioContent: 'base64-audio-content'
      })
      .expect(400, 'Invalid language code.', done);
  });
});

describe('Validate audioContent field', function () {
  it('should fail if audioContent field is missing.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en'
        // audioContent: 'base64-audio-content'
      })
      .expect(400, 'Invalid audio content.', done);
  });
  it('should fail if audioContent field is empty.', function (done) {
    request
      .post('/speechTranslate')
      .send({
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en',
        audioContent: ''
      })
      .expect(400, 'Invalid audio content.', done);
  });
});
