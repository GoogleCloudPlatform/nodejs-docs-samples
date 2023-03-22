// Copyright 2023 Google LLC
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

const supertest = require('supertest');
const functionsFramework = require('@google-cloud/functions-framework/testing');

require('..');

const jsonRetryObject = JSON.stringify({retry: true});
const encodedRetryMessage = Buffer.from(jsonRetryObject).toString('base64');

const jsonDontRetryObject = JSON.stringify({retry: false});
const encodedDontRetryMessage =
  Buffer.from(jsonDontRetryObject).toString('base64');

describe('functions_cloudevent_tips_retry', () => {
  it('should raise error to retry', async () => {
    const cloudEventData = {data: {message: {}}};
    cloudEventData.data.message.data = encodedRetryMessage;

    const promiseServer = functionsFramework.getTestServer('retryPromise');
    await supertest(promiseServer)
      .post('/')
      .send(cloudEventData)
      .set('Content-Type', 'application/json')
      .expect(500);

    const callBackServer = functionsFramework.getTestServer('retryCallback');
    await supertest(callBackServer)
      .post('/')
      .send(cloudEventData)
      .set('Content-Type', 'application/json')
      .expect(500);
  });

  it('should not raise error to not retry', async () => {
    const cloudEventData = {data: {message: {}}};
    cloudEventData.data.message.data = encodedDontRetryMessage;

    const promiseServer = functionsFramework.getTestServer('retryPromise');
    await supertest(promiseServer)
      .post('/')
      .send(cloudEventData)
      .set('Content-Type', 'application/json')
      .expect(204);

    const callBackServer = functionsFramework.getTestServer('retryCallback');
    await supertest(callBackServer)
      .post('/')
      .send(cloudEventData)
      .set('Content-Type', 'application/json')
      .expect(204);
  });
});
