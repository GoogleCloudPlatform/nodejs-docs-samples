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

const assert = require('assert');
const sinon = require('sinon');
const supertest = require('supertest');

const functionsFramework = require('@google-cloud/functions-framework/testing');

beforeEach(() => {
  // require the module that includes the functions we are testing
  require('../index');

  // stub the console so we can use it for side effect assertions
  sinon.stub(console, 'log');
  sinon.stub(console, 'error');
});

afterEach(() => {
  // restore the console stub
  console.log.restore();
  console.error.restore();
});

describe('functions_cloudevent_pubsub', () => {
  it('should process a CloudEvent', async () => {
    const event = {
      data: {
        message: 'd29ybGQ=', // 'World' in base 64
      },
    };

    const server = functionsFramework.getTestServer('helloPubSub');
    await supertest(server)
      .post('/')
      .send(event)
      .set('Content-Type', 'application/json')
      .expect(204);
    assert(console.log.calledWith('Hello, World!'));
  });
});

describe('functions_cloudevent_storage', () => {
  it('should process a CloudEvent', async () => {
    const event = {
      id: '1234',
      type: 'mock-gcs-event',
      data: {
        bucket: 'my-bucket',
        name: 'my-file.txt',
      },
    };
    const server = functionsFramework.getTestServer('helloGCS');
    await supertest(server)
      .post('/')
      .send(event)
      .set('Content-Type', 'application/json')
      .expect(204);

    assert(console.log.calledWith('Event ID: 1234'));
    assert(console.log.calledWith('Event Type: mock-gcs-event'));
    assert(console.log.calledWith('Bucket: my-bucket'));
    assert(console.log.calledWith('File: my-file.txt'));
  });
});

describe('functions_log_cloudevent', () => {
  it('should process a CloudEvent', async () => {
    const event = {
      type: 'google.cloud.audit.log.v1.written',
      subject:
        'storage.googleapis.com/projects/_/buckets/my-bucket/objects/test.txt',
      data: {
        protoPayload: {
          methodName: 'storage.objects.write',
          authenticationInfo: {
            principalEmail: 'example@example.com',
          },
          resourceName: 'some-resource',
        },
      },
    };
    const server = functionsFramework.getTestServer('helloAuditLog');
    await supertest(server)
      .post('/')
      .send(event)
      .set('Content-Type', 'application/json')
      .expect(204);

    assert(console.log.calledWith('API method:', 'storage.objects.write'));
    assert(
      console.log.calledWith('Event type:', 'google.cloud.audit.log.v1.written')
    );
    assert(
      console.log.calledWith(
        'Subject:',
        'storage.googleapis.com/projects/_/buckets/my-bucket/objects/test.txt'
      )
    );
    assert(console.log.calledWith('Resource name:', 'some-resource'));
    assert(console.log.calledWith('Principal:', 'example@example.com'));
  });
});

describe('functions_label_gce_instance', () => {
  it('should validate data', async () => {
    const event = {
      subject: 'invalid/subject/example',
    };
    const server = functionsFramework.getTestServer('autoLabelInstance');
    await supertest(server)
      .post('/')
      .send(event)
      .set('Content-Type', 'application/json')
      .expect(/Invalid event structure/);
  });
});
