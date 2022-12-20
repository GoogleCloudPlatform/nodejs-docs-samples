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

describe('functions_helloworld_pubsub', () => {
  // [START functions_pubsub_unit_test]
  const assert = require('assert');
  const uuid = require('uuid');
  const sinon = require('sinon');

  const {helloPubSub} = require('..');

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

  it('helloPubSub: should print a name', () => {
    // Create mock Pub/Sub event
    const name = uuid.v4();
    const event = {
      data: Buffer.from(name).toString('base64'),
    };

    // Call tested function and verify its behavior
    helloPubSub(event);
    assert.ok(console.log.calledWith(`Hello, ${name}!`));
  });
  // [END functions_pubsub_unit_test]

  it('helloPubSub: should print hello world', () => {
    // Create mock Pub/Sub event
    const event = {};

    // Call tested function and verify its behavior
    helloPubSub(event);
    assert.ok(console.log.calledWith('Hello, World!'));
  });
});
