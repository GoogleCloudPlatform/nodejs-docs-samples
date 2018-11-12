
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
const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

function getSample () {
  const requestPromise = sinon.stub().returns(new Promise((resolve) => resolve(`request sent`)));

  return {
    program: proxyquire(`../`, {
      'request-promise': requestPromise
    }),
    mocks: {
      requestPromise: requestPromise
    }
  };
}

function getMocks () {
  const event = {
    data: {
      data: {}
    }
  };

  const callback = sinon.spy();

  return {
    event: event,
    callback: callback
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

/** Tests for startInstancePubSub */

test(`startInstancePubSub: should accept JSON-formatted event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone', 'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`startInstancePubSub: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});

test(`startInstancePubSub: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'instance' missing from payload`));
});

test(`startInstancePubSub: should fail with empty event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});

/** Tests for stopInstancePubSub */

test(`stopInstancePubSub: should accept JSON-formatted event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone', 'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`stopInstancePubSub: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});

test(`stopInstancePubSub: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'instance' missing from payload`));
});

test(`stopInstancePubSub: should fail with empty event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});
