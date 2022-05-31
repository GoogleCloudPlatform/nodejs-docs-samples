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

'use strict';

const assert = require('assert');
const sinon = require('sinon');
const {getFunction} = require('@google-cloud/functions-framework/testing');
const {Logging} = require('@google-cloud/logging');
const {CloudEvent} = require('cloudevents');
const pkg = require('../package.json');
// Importing our target file
require('../index.js');

describe('functions_structured_logging_event', () => {
  let projectId;

  const writeStub = sinon.stub();
  const writeOriginal = process.stdout.write;

  before(async () => {
    const logging = new Logging();
    projectId = await logging.auth.getProjectId();
  });

  it('structuredLoggingEvent: should correctly print logs', async () => {
    const structuredLoggingEvent = getFunction('structuredLoggingEvent');

    const expected = {
      severity: 'ERROR',
      component: 'arbitrary-property',
      logName: `projects/${projectId}/logs/${pkg.name}`,
      message: 'Hello, world!',
    };

    // Only stub process.stdout.write for this function
    // (This stub would otherwise swallow *all* console output)
    process.stdout.write = writeStub;
    await structuredLoggingEvent(
      // Passing in a mocked CloudEvent object
      new CloudEvent({
        type: 'google.cloud.pubsub.topic.v2.messagePublished',
        source: '//pubsub.googleapis.com/test-topic',
      })
    );
    process.stdout.write = writeOriginal;

    assert.ok(writeStub.callCount);
    assert.ok(writeStub.getCall(0).args.length);

    // Capture the string output & parse
    const result = JSON.parse(writeStub.getCall(0).args[0]);

    assert.equal(result.severity, expected.severity);
    assert.equal(result.logName, expected.logName);
    assert.equal(result.component, expected.component);
    assert.equal(result.message, expected.message);
  });
});
