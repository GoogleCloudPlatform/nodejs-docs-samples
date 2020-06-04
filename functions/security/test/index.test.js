// Copyright 2017 Google LLC
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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');

const getSample = () => {
  const getMock = sinon
    .stub()
    .onFirstCall()
    .resolves({data: 'some-token'})
    .onSecondCall()
    .resolves({data: 'function-response'});

  const axiosMock = {get: getMock};

  const resMock = {};
  resMock.status = sinon.stub().returns(resMock);
  resMock.send = sinon.stub().returns(resMock);

  return {
    sample: proxyquire('../', {
      axios: axiosMock,
    }),
    mocks: {
      res: resMock,
      axios: axiosMock,
    },
  };
};

describe('functions_bearer_token', () => {
  it('should run', async () => {
    const {sample, mocks} = getSample();

    await sample.callingFunction(null, mocks.res);

    assert(mocks.axios.get.calledTwice);
    assert.deepEqual(mocks.axios.get.firstCall.args[1], {
      headers: {'Metadata-Flavor': 'Google'},
    });

    assert(mocks.res.send.calledWith('function-response'));
  });
});
