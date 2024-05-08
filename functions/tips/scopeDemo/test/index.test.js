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
const assert = require('assert');
const {getFunction} = require('@google-cloud/functions-framework/testing');

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

describe('functions_tips_scopes cloudrun_tips_global_scope', () => {
  const computations = sinon.spy(require('../computations'));

  require('..');
  const scopeDemo = getFunction('scopeDemo');
  it('tips:scopeDemo: should perform the heavy computation once', () => {
    const mocks = getMocks();

    const numRequests = 25;
    for (let i = 0; i < numRequests; i++) {
      scopeDemo(mocks.req, mocks.res);
    }

    assert.strictEqual(computations.heavyComputation.calledOnce, true);
  });

  it('tips:scopeDemo: should perform the light computation repeatedly', () => {
    const mocks = getMocks();
    computations.lightComputation.resetHistory();

    const numRequests = 25;
    for (let i = 0; i < numRequests; i++) {
      scopeDemo(mocks.req, mocks.res);
    }

    assert.strictEqual(computations.lightComputation.callCount, numRequests);
  });
});
