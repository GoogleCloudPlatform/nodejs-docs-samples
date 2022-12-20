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

const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');

const getSample = () => {
  const firestoreMock = {
    doc: sinon.stub().returnsThis(),
    set: sinon.stub(),
  };

  return {
    program: proxyquire('../', {
      '@google-cloud/firestore': sinon.stub().returns(firestoreMock),
    }),
    mocks: {
      firestore: firestoreMock,
    },
  };
};

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

describe('functions_firebase_auth', () => {
  it('should listen to Auth events', () => {
    const sample = getSample();
    const date = Date.now();
    const event = {
      resource: 'resource',
      uid: 'me',
      email: 'me@example.com',
      metadata: {
        createdAt: date,
      },
    };

    sample.program.helloAuth(event);

    assert.strictEqual(
      console.log.calledWith('Function triggered by change to user: me'),
      true
    );
    assert.strictEqual(console.log.calledWith(`Created at: ${date}`), true);
    assert.strictEqual(console.log.calledWith('Email: me@example.com'), true);
  });
});
