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

const sinon = require('sinon');
const assert = require('assert');
const {getFunction} = require('@google-cloud/functions-framework/testing');

require('..');

// Define a describe block
describe('functions_cloudevent_tips_infinite_retries', () => {
  const setupStubs = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
    sinon.stub(Date, 'now').returns(Date.parse('2023-02-24T12:00:00Z'));
  };

  beforeEach(setupStubs);
  afterEach(() => {
    sinon.restore();
  });

  it('should ignore events that are too old', () => {
    const avoidInfiniteRetries = getFunction('avoidInfiniteRetries');
    const cb = sinon.stub();

    // Create an event that is too old
    const event = {
      time: '2023-02-20T12:00:00Z',
    };
    const eventAge = Date.now() - Date.parse(event.time);

    avoidInfiniteRetries(event, cb);
    assert(
      console.log.calledWith(`Dropping event ${event} with age ${eventAge} ms.`)
    );
  });

  // Test that the function retries failed executions
  it('should process events that are not too old', () => {
    const avoidInfiniteRetries = getFunction('avoidInfiniteRetries');
    const cb = sinon.stub();

    // Create recent event
    const event = {
      time: '2023-02-24T11:59:56Z',
    };
    const eventAge = Date.now() - Date.parse(event.time);

    avoidInfiniteRetries(event, cb);
    assert(
      console.log.calledWith(
        `Processing event ${event} with age ${eventAge} ms.`
      )
    );
  });
});
