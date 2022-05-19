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

// FF testing layer for declarative signatures
const {getFunction} = require('@google-cloud/functions-framework/testing');

describe('functions_helloworld_http', () => {
  // [START functions_http_unit_test]
  const sinon = require('sinon');
  const assert = require('assert');
  require('../');

  const getMocks = () => {
    const req = {body: {}, query: {}};

    return {
      req: req,
      res: {
        send: sinon.stub().returnsThis(),
      },
    };
  };

  it('helloHttp: should print a name', () => {
    const mocks = getMocks();

    const helloHttp = getFunction('helloHttp');
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello World!'), true);
  });
  // [END functions_http_unit_test]
  it('helloHttp: should print a name with query', () => {
    const mocks = getMocks();
    mocks.req.query = {name: 'John'};

    const helloHttp = getFunction('helloHttp');
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello John!'), true);
  });

  it('helloHttp: should print a name with req body', () => {
    const mocks = getMocks();
    mocks.req.body = {name: 'John'};

    const helloHttp = getFunction('helloHttp');
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello John!'), true);
  });
});
