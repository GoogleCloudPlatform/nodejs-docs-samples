/**
 * Copyright 2018, Google, Inc.
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

const Buffer = require('safe-buffer').Buffer;
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

function getSample() {
  const requestPromise = sinon
    .stub()
    .returns(new Promise(resolve => resolve('request sent')));

  return {
    program: proxyquire('../', {
      'request-promise': requestPromise,
    }),
    mocks: {
      requestPromise: requestPromise,
    },
  };
}

function getMocks() {
  const event = {
    data: {
      data: {},
    },
  };

  const callback = sinon.spy();

  return {
    event: event,
    callback: callback,
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

/** Tests for startInstancePubSub */

it('startInstancePubSub: should accept JSON-formatted event payload', async () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {zone: 'test-zone', instance: 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  const data = await sample.mocks.requestPromise();
  // The request was successfully sent.
  assert.strictEqual(data, 'request sent');
});

it(`startInstancePubSub: should fail with missing 'zone' attribute`, () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {instance: 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  assert.deepStrictEqual(
    mocks.callback.firstCall.args[0],
    new Error(`Attribute 'zone' missing from payload`)
  );
});

it(`startInstancePubSub: should fail with missing 'instance' attribute`, () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {zone: 'test-zone'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  assert.deepStrictEqual(
    mocks.callback.firstCall.args[0],
    new Error(`Attribute 'instance' missing from payload`)
  );
});

it('startInstancePubSub: should fail with empty event payload', () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  assert.deepStrictEqual(
    mocks.callback.firstCall.args[0],
    new Error(`Attribute 'zone' missing from payload`)
  );
});

/** Tests for stopInstancePubSub */

it('stopInstancePubSub: should accept JSON-formatted event payload', async () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {zone: 'test-zone', instance: 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  const data = await sample.mocks.requestPromise();
  // The request was successfully sent.
  assert.strictEqual(data, 'request sent');
});

it(`stopInstancePubSub: should fail with missing 'zone' attribute`, () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {instance: 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  assert.deepStrictEqual(
    mocks.callback.firstCall.args[0],
    new Error(`Attribute 'zone' missing from payload`)
  );
});

it(`stopInstancePubSub: should fail with missing 'instance' attribute`, () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {zone: 'test-zone'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  assert.deepStrictEqual(
    mocks.callback.firstCall.args[0],
    new Error(`Attribute 'instance' missing from payload`)
  );
});

it('stopInstancePubSub: should fail with empty event payload', () => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString(
    'base64'
  );
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  assert.deepStrictEqual(
    mocks.callback.firstCall.args[0],
    new Error(`Attribute 'zone' missing from payload`)
  );
});
