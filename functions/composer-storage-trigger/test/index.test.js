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

function getSample () {
  const bodyJson = {};
  const body = {
    json: sinon.stub().resolves(bodyJson)
  };
  const FetchMock = sinon.stub().resolves(body);

  return {
    program: proxyquire(`../`, {
      'node-fetch': FetchMock
    }),
    mocks: {
      fetch: FetchMock,
      body: body,
      bodyJson: bodyJson
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
  const sample = getSample();
  sample.mocks.bodyJson.error = expectedMsg;

  sample.program.triggerDag(event, (err, message) => {
    t.regex(err, /Something bad happened/);
    t.is(message, undefined);
    t.end();
  });
});
