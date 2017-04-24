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

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const Buffer = require('safe-buffer').Buffer;

const TOPIC = `topic`;
const MESSAGE = `Hello, world!`;

function getSample () {
  const topicMock = {
    publish: sinon.stub().returns(Promise.resolve())
  };
  const pubsubMock = {
    topic: sinon.stub().returns(topicMock)
  };
  const PubSubMock = sinon.stub().returns(pubsubMock);

  return {
    program: proxyquire(`../`, {
      '@google-cloud/pubsub': PubSubMock
    }),
    mocks: {
      PubSub: PubSubMock,
      pubsub: pubsubMock,
      topic: topicMock,
      req: {
        body: {
          topic: TOPIC,
          message: MESSAGE
        }
      },
      res: {
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis()
      }
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`Publish fails without a topic`, (t) => {
  const expectedMsg = `Topic not provided. Make sure you have a "topic" property in your request`;
  const sample = getSample();

  delete sample.mocks.req.body.topic;
  sample.program.publish(sample.mocks.req, sample.mocks.res);

  t.deepEqual(sample.mocks.res.status.callCount, 1);
  t.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
  t.deepEqual(sample.mocks.res.send.callCount, 1);
  t.is(sample.mocks.res.send.firstCall.args[0].message, expectedMsg);
});

test.serial(`Publish fails without a message`, (t) => {
  const expectedMsg = `Message not provided. Make sure you have a "message" property in your request`;
  const sample = getSample();

  delete sample.mocks.req.body.message;
  sample.program.publish(sample.mocks.req, sample.mocks.res);

  t.deepEqual(sample.mocks.res.status.callCount, 1);
  t.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
  t.deepEqual(sample.mocks.res.send.callCount, 1);
  t.is(sample.mocks.res.send.firstCall.args[0].message, expectedMsg);
});

test.serial(`Publishes the message to the topic and calls success`, async (t) => {
  const expectedMsg = `Message published.`;
  const sample = getSample();

  await sample.program.publish(sample.mocks.req, sample.mocks.res);
  t.deepEqual(sample.mocks.topic.publish.callCount, 1);
  t.deepEqual(sample.mocks.topic.publish.firstCall.args, [{
    data: {
      message: MESSAGE
    }
  }]);
  t.deepEqual(sample.mocks.res.status.callCount, 1);
  t.deepEqual(sample.mocks.res.status.firstCall.args, [200]);
  t.deepEqual(sample.mocks.res.send.callCount, 1);
  t.deepEqual(sample.mocks.res.send.firstCall.args, [expectedMsg]);
});

test.serial(`Fails to publish the message and calls failure`, async (t) => {
  const error = new Error(`error`);
  const sample = getSample();
  sample.mocks.topic.publish.returns(Promise.reject(error));

  const err = await t.throws(sample.program.publish(sample.mocks.req, sample.mocks.res));
  t.deepEqual(err, error);
  t.deepEqual(console.error.callCount, 1);
  t.deepEqual(console.error.firstCall.args, [error]);
  t.deepEqual(sample.mocks.res.status.callCount, 1);
  t.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
  t.deepEqual(sample.mocks.res.send.callCount, 1);
  t.deepEqual(sample.mocks.res.send.firstCall.args, [error]);
});

test.serial(`Subscribes to a message`, (t) => {
  const callback = sinon.stub();
  const json = JSON.stringify({ data: MESSAGE });
  const event = {
    data: {
      data: Buffer.from(json).toString('base64')
    }
  };

  const sample = getSample();
  sample.program.subscribe(event, callback);

  t.deepEqual(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [json]);
  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, []);
});
