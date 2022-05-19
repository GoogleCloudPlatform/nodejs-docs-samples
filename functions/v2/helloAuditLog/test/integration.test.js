// Copyright 2022 Google LLC
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
require('../index');

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
  });
});
