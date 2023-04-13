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

const sinon = require('sinon');
const assert = require('assert');
const protobuf = require('protobufjs');
const rewire = require('rewire');
const fnModule = rewire('..');
const {getFunction} = require('@google-cloud/functions-framework/testing');

const stubConsole = function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};

const makeCloudEvent = async function (stringValue) {
  const root = await protobuf.load('data.proto');
  const DocumentEventData = root.lookupType(
    'google.events.cloud.firestore.v1.DocumentEventData'
  );

  const payload = DocumentEventData.create({
    value: {
      name: 'foo/documents/bar',
      fields: {
        original: {
          stringValue: stringValue,
        },
      },
    },
  });

  return {
    source: 'firebase',
    type: 'google.cloud.firestore.document.v1.updated',
    data: DocumentEventData.encode(payload).finish(),
  };
};

describe('functions_cloudevent_firebase_reactive', () => {
  let firestoreMock;

  beforeEach(() => {
    stubConsole();
    // Mock the Firestore client
    firestoreMock = {
      doc: sinon.stub().returnsThis(),
      set: sinon.stub(),
    };
    // Replace the global `firestore` object with the mock object
    fnModule.__set__('firestore', firestoreMock);
  });

  afterEach(() => {
    // Reset the global `firestore` object after each test
    fnModule.__set__('firestore', null);
    restoreConsole();
  });

  it('should capitalize original value', async () => {
    const makeUpperCase = getFunction('makeUpperCase');

    await makeUpperCase(await makeCloudEvent('abc'));

    assert.strictEqual(
      console.log.calledWith('Replacing value: abc --> ABC'),
      true
    );
  });

  it('should do nothing if value is already capitalized', async () => {
    const makeUpperCase = getFunction('makeUpperCase');

    await makeUpperCase(await makeCloudEvent('ABC'));

    assert.strictEqual(
      console.log.calledWith('Value is already upper-case.'),
      true
    );
  });
});
