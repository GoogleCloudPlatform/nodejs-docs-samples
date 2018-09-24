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

const test = require('ava');
const supertest = require('supertest');
const request = supertest(process.env.BASE_URL);

test.cb('speechTranslate: No encoding field', t => {
  request
    .post('/speechTranslate')
    .send({
      // encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en',
      audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Invalid encoding.');
    })
    .end(t.end);
});

test.cb('speechTranslate: Empty encoding field', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: '',
      sampleRateHertz: 16000,
      languageCode: 'en',
      audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Invalid encoding.');
    })
    .end(t.end);
});

test.cb('speechTranslate: No sampleRateHertz field', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      // sampleRateHertz: 16000,
      languageCode: 'en',
      audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Sample rate hertz must be numeric.');
    })
    .end(t.end);
});

test.cb('speechTranslate: Empty sampleRateHertz field', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: '',
      languageCode: 'en',
      audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Sample rate hertz must be numeric.');
    })
    .end(t.end);
});

test.cb('speechTranslate: SampleRateHertz field is not a number', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: 'Not a number',
      languageCode: 'en',
      audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Sample rate hertz must be numeric.');
    })
    .end(t.end);
});

test.cb('speechTranslate: No languageCode field', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      // languageCode: 'en',
      audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Invalid language code.');
    })
    .end(t.end);
});

test.cb('speechTranslate: Empty languageCode field', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: '',
      audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Invalid language code.');
    })
    .end(t.end);
});

test.cb('speechTranslate: No audioContent field', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en'
      // audioContent: 'base64-audio-content'
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Invalid audio content.');
    })
    .end(t.end);
});

test.cb('speechTranslate: Empty audioContent field', t => {
  request
    .post('/speechTranslate')
    .send({
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en',
      audioContent: ''
    })
    .expect(400)
    .expect((response) => {
      t.is(response.text, 'Invalid audio content.');
    })
    .end(t.end);
});
