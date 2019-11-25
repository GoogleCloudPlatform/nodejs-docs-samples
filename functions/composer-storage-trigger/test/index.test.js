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

'use strict';

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');

const getSample = FetchStub => {
  return {
    program: proxyquire('../', {
      'node-fetch': FetchStub,
    }),
    mocks: {
      fetch: FetchStub,
    },
  };
};

describe('composer_trigger', () => {
  it('Handles error in JSON body', async () => {
    const event = {
      data: {
        file: 'some-file',
      },
    };
    const expectedMsg = 'Something bad happened.';
    const bodyJson = {error: expectedMsg};
    const body = {
      json: sinon.stub().returns(bodyJson),
    };
    const sample = getSample(sinon.stub().resolves(body));

    try {
      await sample.program.triggerDag(event);
      assert.fail('No error thrown');
    } catch (err) {
      assert.deepStrictEqual(err, new Error('Something bad happened.'));
    }
  });

  it('Handles error in IAP response.', async () => {
    const event = {
      data: {
        file: 'some-file',
      },
    };
    const expectedMsg = 'Default IAP Error Message.';

    const serviceAccountAccessTokenRes = {
      json: sinon.stub().resolves({access_token: 'default-access-token'}),
    };
    const signJsonClaimRes = {
      json: sinon.stub().resolves({signature: 'default-jwt-signature'}),
    };
    const getTokenRes = {
      json: sinon.stub().resolves({id_token: 'default-id-token'}),
    };
    const makeIapPostRequestRes = {
      ok: false,
      text: sinon.stub().resolves(expectedMsg),
    };
    const FetchStub = sinon
      .stub()
      .onCall(0)
      .resolves(serviceAccountAccessTokenRes)
      .onCall(1)
      .resolves(signJsonClaimRes)
      .onCall(2)
      .resolves(getTokenRes)
      .onCall(3)
      .resolves(makeIapPostRequestRes);
    const sample = getSample(FetchStub);
    try {
      await sample.program.triggerDag(event);
    } catch (err) {
      assert.deepStrictEqual(err, new Error(expectedMsg));
    }
  });
});
