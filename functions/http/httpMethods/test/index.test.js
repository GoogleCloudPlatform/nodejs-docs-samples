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

describe('functions_http_method', () => {
  require('..');
  const helloHttp = getFunction('helloHttp');

  it('http:helloHttp: should handle GET', () => {
    const mocks = getMocks();
    mocks.req.method = 'GET';
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello World!');
  });

  it('http:helloHttp: should handle PUT', () => {
    const mocks = getMocks();
    mocks.req.method = 'PUT';
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 403);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Forbidden!');
  });

  it('http:helloHttp: should handle other methods', () => {
    const mocks = getMocks();
    mocks.req.method = 'POST';
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 405);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.deepStrictEqual(mocks.res.send.firstCall.args[0], {
      error: 'Something blew up!',
    });
  });
});
