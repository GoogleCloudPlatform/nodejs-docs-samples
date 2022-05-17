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

describe('functions_cloudevent_storage', () => {
  const assert = require('assert');
  const sinon = require('sinon');
  require('..');

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

  it('helloGCS: should print out event', () => {
    const event = {
      id: '1234',
      type: 'mock-gcs-event',
      data: {
        bucket: 'my-bucket',
        name: 'my-file.txt',
      },
    };

    // Call tested function and verify its behavior
    const helloGCS = getFunction('helloGCS');
    helloGCS(event);

    assert(console.log.calledWith('Event ID: 1234'));
    assert(console.log.calledWith('Event Type: mock-gcs-event'));
    assert(console.log.calledWith('Bucket: my-bucket'));
    assert(console.log.calledWith('File: my-file.txt'));
  });
});
