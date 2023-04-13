// Copyright 2018 Google LLC
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

describe('functions_helloworld_storage', () => {
  // [START functions_storage_unit_test]
  const assert = require('assert');
  const uuid = require('uuid');
  const sinon = require('sinon');

  const {helloGCS} = require('..');

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
    // Initialize mocks
    const filename = uuid.v4();
    const eventType = 'google.storage.object.finalize';
    const event = {
      name: filename,
      resourceState: 'exists',
      metageneration: '1',
    };
    const context = {
      eventId: 'g1bb3r1sh',
      eventType: eventType,
    };

    // Call tested function and verify its behavior
    helloGCS(event, context);
    assert.ok(console.log.calledWith(`  File: ${filename}`));
    assert.ok(console.log.calledWith(`  Event Type: ${eventType}`));
  });
  // [END functions_storage_unit_test]
});
