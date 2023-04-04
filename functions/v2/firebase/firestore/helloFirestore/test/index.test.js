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
const protobuf = require('protobufjs');

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

describe('functions_cloudevent_firebase_firestore', () => {
  it('should listen to Firestore', async () => {
    const helloFirestore = getFunction('helloFirestore');

    const root = await protobuf.load('data.proto');
    const DocumentEventData = root.lookupType(
      'google.events.cloud.firestore.v1.DocumentEventData'
    );
    const Document = root.lookupType(
      'google.events.cloud.firestore.v1.Document'
    );

    const data = DocumentEventData.create({
      oldValue: Document.create({
        name: 'old-doc',
        fields: {
          foo: {stringValue: 'bar'},
        },
      }),
      value: Document.create({
        name: 'new-doc',
        fields: {
          foo: {stringValue: 'baz'},
        },
      }),
    });

    const cloudEvent = {
      source: 'firebase',
      type: 'google.cloud.firestore.document.v1.updated',
      data: DocumentEventData.encode(data).finish(),
    };

    await helloFirestore(cloudEvent);

    assert.ok(
      console.log.calledWith('Function triggered by event on: firebase')
    );
    assert.ok(
      console.log.calledWith(
        'Event type: google.cloud.firestore.document.v1.updated'
      )
    );
    assert.ok(console.log.calledWith('Loading protos...'));
    assert.ok(console.log.calledWith('Decoding data...'));
    assert.ok(console.log.calledWith('\nOld value:'));
    assert.ok(console.log.calledWith(JSON.stringify(data.oldValue, null, 2)));
    assert.ok(console.log.calledWith('\nNew value:'));
    assert.ok(console.log.calledWith(JSON.stringify(data.value, null, 2)));
  });
});
