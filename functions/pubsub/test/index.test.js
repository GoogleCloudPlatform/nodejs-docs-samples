/**
 * Copyright 2017, Google, Inc.
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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const Buffer = require('safe-buffer').Buffer;

const TOPIC = 'topic';
const MESSAGE = 'Hello, world!';

function getSample() {
  const topicMock = {
    publish: sinon.stub().returns(Promise.resolve()),
  };
  const pubsubMock = {
    topic: sinon.stub().returns(topicMock),
  };
  const PubSubMock = sinon.stub().returns(pubsubMock);

  return {
    program: proxyquire('../', {
      '@google-cloud/pubsub': {PubSub: PubSubMock},
    }),
    mocks: {
      PubSub: PubSubMock,
      pubsub: pubsubMock,
      topic: topicMock,
      req: {
        body: {
          topic: TOPIC,
          message: MESSAGE,
        },
      },
      res: {
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
      },
    },
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('Publish fails without a topic', () => {
  const expectedMsg =
    'Topic not provided. Make sure you have a "topic" property in your request';
  const sample = getSample();

  delete sample.mocks.req.body.topic;
  sample.program.publish(sample.mocks.req, sample.mocks.res);

  assert.strictEqual(sample.mocks.res.status.callCount, 1);
  assert.deepStrictEqual(sample.mocks.res.status.firstCall.args, [500]);
  assert.strictEqual(sample.mocks.res.send.callCount, 1);
  assert.strictEqual(
    sample.mocks.res.send.firstCall.args[0].message,
    expectedMsg
  );
});

it('Publish fails without a message', () => {
  const expectedMsg =
    'Message not provided. Make sure you have a "message" property in your request';
  const sample = getSample();

  delete sample.mocks.req.body.message;
  sample.program.publish(sample.mocks.req, sample.mocks.res);

  assert.strictEqual(sample.mocks.res.status.callCount, 1);
  assert.deepStrictEqual(sample.mocks.res.status.firstCall.args, [500]);
  assert.strictEqual(sample.mocks.res.send.callCount, 1);
  assert.strictEqual(
    sample.mocks.res.send.firstCall.args[0].message,
    expectedMsg
  );
});

it('Publishes the message to the topic and calls success', async () => {
  const expectedMsg = 'Message published.';
  const sample = getSample();

  await sample.program.publish(sample.mocks.req, sample.mocks.res);
  assert.strictEqual(sample.mocks.topic.publish.callCount, 1);
  assert.deepStrictEqual(sample.mocks.topic.publish.firstCall.args, [
    {
      data: {
        message: MESSAGE,
      },
    },
  ]);
  assert.strictEqual(sample.mocks.res.status.callCount, 1);
  assert.deepStrictEqual(sample.mocks.res.status.firstCall.args, [200]);
  assert.strictEqual(sample.mocks.res.send.callCount, 1);
  assert.deepStrictEqual(sample.mocks.res.send.firstCall.args, [expectedMsg]);
});

it('Fails to publish the message and calls failure', async () => {
  const error = new Error('error');
  const sample = getSample();
  sample.mocks.topic.publish.returns(Promise.reject(error));

  try {
    await sample.program.publish(sample.mocks.req, sample.mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
    assert.strictEqual(console.error.callCount, 1);
    assert.deepStrictEqual(console.error.firstCall.args, [error]);
    assert.strictEqual(sample.mocks.res.status.callCount, 1);
    assert.deepStrictEqual(sample.mocks.res.status.firstCall.args, [500]);
    assert.strictEqual(sample.mocks.res.send.callCount, 1);
    assert.deepStrictEqual(sample.mocks.res.send.firstCall.args, [error]);
  }
});

it('Subscribes to a message', () => {
  const callback = sinon.stub();
  const json = JSON.stringify({data: MESSAGE});
  const event = {
    data: {
      data: Buffer.from(json).toString('base64'),
    },
  };

  const sample = getSample();
  sample.program.subscribe(event, callback);

  assert.strictEqual(console.log.callCount, 1);
  assert.deepStrictEqual(console.log.firstCall.args, [json]);
  assert.strictEqual(callback.callCount, 1);
  assert.deepStrictEqual(callback.firstCall.args, []);
});
