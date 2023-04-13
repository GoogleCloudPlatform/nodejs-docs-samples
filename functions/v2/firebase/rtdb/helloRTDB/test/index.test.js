// Copyright 2023 Google LLC
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

const {getFunction} = require('@google-cloud/functions-framework/testing');
const sinon = require('sinon');
const assert = require('assert');

require('..');

const stubConsole = function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};

beforeEach(stubConsole);
afterEach(restoreConsole);

describe('functions_cloudevent_firebase_rtdb', () => {
  it('should listen to RTDB', () => {
    const helloRTDB = getFunction('helloRTDB');

    const delta = {
      foo: 'bar',
    };

    const data = {
      hello: 'world',
    };

    const event = {
      source: 'resource',
      data: {
        data: data,
        delta: delta,
      },
    };
    helloRTDB(event);

    assert.strictEqual(
      console.log.calledWith('Function triggered by change to: resource'),
      true
    );
    assert.strictEqual(
      console.log.calledWith(JSON.stringify(data, null, 2)),
      true
    );
    assert.strictEqual(
      console.log.calledWith(JSON.stringify(delta, null, 2)),
      true
    );
  });
});
