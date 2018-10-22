/**
 * Copyright 2018 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);

function getSample (FetchStub) {
  return {
    program: proxyquire(`../`, {
      'node-fetch': FetchStub
    }),
    mocks: {
      fetch: FetchStub
    }
  };
}

test.cb(`Handles error in JSON body`, (t) => {
  const event = {
    data: {
      file: `some-file`
    }
  };
  const expectedMsg = `Something bad happened.`;
  const bodyJson = {'error': expectedMsg};
  const body = {
    json: sinon.stub().resolves(bodyJson)
  };
  const sample = getSample(sinon.stub().resolves(body));

  sample.program.triggerDag(event).catch(function (err) {
    t.regex(err, /Something bad happened/);
    t.end();
  });
});

test.cb(`Handles error in IAP response.`, (t) => {
  const event = {
    data: {
      file: `some-file`
    }
  };
  const expectedMsg = 'Default IAP Error Message.';

  const serviceAccountAccessTokenRes = {
    json: sinon.stub().resolves({'access_token': 'default-access-token'})
  };
  const signJsonClaimRes = {json: sinon.stub().resolves({'signature': 'default-jwt-signature'})};
  const getTokenRes = {json: sinon.stub().resolves({'id_token': 'default-id-token'})};
  const makeIapPostRequestRes = {ok: false, text: sinon.stub().resolves(expectedMsg)};
  const FetchStub = sinon.stub()
    .onCall(0).resolves(serviceAccountAccessTokenRes)
    .onCall(1).resolves(signJsonClaimRes)
    .onCall(2).resolves(getTokenRes)
    .onCall(3).resolves(makeIapPostRequestRes);
  const sample = getSample(FetchStub);

  sample.program.triggerDag(event).catch(function (err) {
    t.is(err, expectedMsg);
    t.end();
  });
});
