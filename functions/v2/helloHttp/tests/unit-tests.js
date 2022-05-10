// Copyright 2021 Google LLC
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

// FF testing layer for declarative signatures
const { getFunction } = require('@google-cloud/functions-framework/testing');

const sinon = require('sinon');
const assert = require('assert');
const functions = require('../');

const getMocks = () => {
  const req = {body: {}, query: {}};

  return {
    req: req,
    res: {
      send: sinon.stub().returnsThis()
    }
  };
};

describe('http function unit-tests', () => {
  it('should return hello world when both body and query are empty', () => {    
    const mocks = getMocks();

    const helloHttp = getFunction('helloHttp');
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello World!'), true);
  });

  it('should return Hello John! when query parameter contains a name', () => {    
    const mocks = getMocks();
    mocks.req.query = { name: 'John' };

    const helloHttp = getFunction('helloHttp');
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello John!'), true);
  });

    it('should return Hello John! when body contains a name', () => {    
    const mocks = getMocks();
    mocks.req.body = { name: 'John' };

    const helloHttp = getFunction('helloHttp');
    helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello John!'), true);
  });
});

