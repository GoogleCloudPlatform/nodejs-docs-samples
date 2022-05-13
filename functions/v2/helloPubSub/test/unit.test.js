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

describe('functions_cloudevent_pubsub', () => {
  const assert = require('assert');
  const uuid = require('uuid');
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

  it('should print a name from the pubsub message', () => {
    // Create mock Pub/Sub event
    const cloudEvent = {data: {message: {}}};
    const name = uuid.v4();
    cloudEvent.data.message = {
      data: Buffer.from(name).toString('base64'),
    };

    // Call tested function and verify its behavior
    const helloPubSub = getFunction('helloPubSub');
    helloPubSub(cloudEvent);
    assert.ok(console.log.calledWith(`Hello, ${name}!`));
  });

  it('helloPubSub: should print hello world', () => {
    // Create mock Pub/Sub event, in the event where a
    // PubSub message is empty but message has an attribute
    const cloudEvent = {data: {message: {data: null}}};

    // Call tested function and verify its behavior
    const helloPubSub = getFunction('helloPubSub');
    helloPubSub(cloudEvent);
    assert.ok(console.log.calledWith('Hello, World!'));
  });
});
