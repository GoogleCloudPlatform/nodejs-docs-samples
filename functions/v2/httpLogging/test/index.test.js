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
const pkg = require('../package.json');
const {Logging} = require('@google-cloud/logging');
const {getFunction} = require('@google-cloud/functions-framework/testing');
// Importing our target file
require('../index.js');

describe('functions_structured_logging', () => {
  let mockReq;
  let mockRes;
  let projectId;
  const mockTraceValue = '15000';

  const writeStub = sinon.stub();
  const writeOriginal = process.stdout.write;

  before(async () => {
    const logging = new Logging();
    projectId = await logging.auth.getProjectId();

    mockReq = {
      requestMethod: 'GET',
      requestUrl: '/',
      userAgent: 'foobar',
      headers: {
        'x-cloud-trace-context': `${mockTraceValue}/2;o=1`,
      },
    };
    mockRes = {
      status: () => ({send: () => {}}),
    };
  });

  it('structuredLogging functions http: should correctly print logs', async () => {
    const structuredLogging = getFunction('structuredLogging');

    // Only stub process.stdout.write for this function
    // (This stub would otherwise swallow *all* console output)
    process.stdout.write = writeStub;

    // Call our function with dummy request and response objects
    await structuredLogging(mockReq, mockRes);

    // Restore process.stdout.write (to avoid breaking console output)
    process.stdout.write = writeOriginal;

    const expected = {
      severity: 'NOTICE',
      component: 'arbitrary-property',
      httpRequest: mockReq,
      logName: `projects/${projectId}/logs/${pkg.name}`,
      'logging.googleapis.com/trace': `projects/${projectId}/traces/${mockTraceValue}`,
    };

    assert.ok(writeStub.callCount);
    assert.ok(writeStub.getCall(0).args.length);

    // Capture the string output & parse
    const result = JSON.parse(writeStub.getCall(0).args[0]);

    assert.equal(result.message, 'Hello, world!');
    assert.equal(result.severity, expected['severity']);
    assert.equal(result.component, expected['component']);
    assert.equal(result.logName, expected['logName']);
    assert.equal(
      result['logging.googleapis.com/trace'],
      expected['logging.googleapis.com/trace']
    );
    assert.notStrictEqual(result.httpRequest, expected['httpRequest']);
  });
});
