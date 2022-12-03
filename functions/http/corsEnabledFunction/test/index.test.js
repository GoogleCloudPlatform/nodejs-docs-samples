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

const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');

const getSample = () => {
  const requestPromise = sinon
    .stub()
    .returns(new Promise(resolve => resolve('test')));

  return {
    sample: proxyquire('../', {
      'request-promise': requestPromise,
    }),
    mocks: {
      requestPromise: requestPromise,
    },
  };
};

const getMocks = () => {
  const req = {
    headers: {},
    get: function (header) {
      return this.headers[header];
    },
  };
  sinon.spy(req, 'get');

  const corsPreflightReq = {
    method: 'OPTIONS',
  };

  const corsMainReq = {
    method: 'GET',
  };

  return {
    req: req,
    corsPreflightReq: corsPreflightReq,
    corsMainReq: corsMainReq,
    res: {
      set: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      end: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    },
  };
};

const stubConsole = function () {
  sinon.stub(console, 'error');
};

const restoreConsole = function () {
  console.error.restore();
};

beforeEach(stubConsole);
afterEach(restoreConsole);

describe('functions_http_cors', () => {
  it('http:cors: should respond to preflight request (no auth)', () => {
    const mocks = getMocks();
    const httpSample = getSample();

    httpSample.sample.corsEnabledFunction(mocks.corsPreflightReq, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnceWith(204), true);
    assert.strictEqual(mocks.res.send.called, true);
  });

  it('http:cors: should respond to main request (no auth)', () => {
    const mocks = getMocks();
    const httpSample = getSample();

    httpSample.sample.corsEnabledFunction(mocks.corsMainReq, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello World!'), true);
  });
});
