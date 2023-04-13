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

const {getFunction} = require('@google-cloud/functions-framework/testing');
require('..');

describe('functions_log_cloudevent', () => {
  const assert = require('assert');
  const sinon = require('sinon');

  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should print content from the audit log', () => {
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

    // Call tested function and verify its behavior
    const helloAuditLog = getFunction('helloAuditLog');
    helloAuditLog(event);

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
