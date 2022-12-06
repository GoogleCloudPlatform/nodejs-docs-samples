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

describe('functions_firebase_reactive', () => {
  it('should capitalize original value', () => {
    const sample = getSample();

    const value = {
      name: 'foo/documents/bar',
      fields: {
        original: {
          stringValue: 'abc',
        },
      },
    };

    const event = {
      eventType: 'type',
      value: value,
    };

    sample.program.makeUpperCase(event);

    assert.strictEqual(
      console.log.calledWith('Replacing value: abc --> ABC'),
      true
    );
    assert.strictEqual(sample.mocks.firestore.doc.calledWith('bar'), true);
    assert.strictEqual(sample.mocks.firestore.set.callCount, 1);
  });

  it('should do nothing if value is already capitalized', () => {
    const sample = getSample();

    const value = {
      name: 'foo/documents/bar',
      fields: {
        original: {
          stringValue: 'ABC',
        },
      },
    };

    const event = {
      eventType: 'type',
      value: value,
    };

    sample.program.makeUpperCase(event);

    assert.strictEqual(
      console.log.calledWith('Value is already upper-case.'),
      true
    );
    assert.strictEqual(sample.mocks.firestore.set.callCount, 0);
  });
});
