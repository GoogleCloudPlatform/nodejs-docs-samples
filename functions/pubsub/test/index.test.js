/**
 * Copyright 2016, Google, Inc.
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

describe(`functions:pubsub`, () => {
  it(`Publish fails without a topic`, () => {
    const expectedMsg = `Topic not provided. Make sure you have a "topic" property in your request`;
    const sample = getSample();

    delete sample.mocks.req.body.topic;
    sample.program.publish(sample.mocks.req, sample.mocks.res);

    assert.deepEqual(sample.mocks.res.status.callCount, 1);
    assert.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
    assert.deepEqual(sample.mocks.res.send.callCount, 1);
    assert.deepEqual(sample.mocks.res.send.firstCall.args[0].message, expectedMsg);
  });

  it(`Publish fails without a message`, () => {
    const expectedMsg = `Message not provided. Make sure you have a "message" property in your request`;
    const sample = getSample();

    delete sample.mocks.req.body.message;
    sample.program.publish(sample.mocks.req, sample.mocks.res);

    assert.deepEqual(sample.mocks.res.status.callCount, 1);
    assert.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
    assert.deepEqual(sample.mocks.res.send.callCount, 1);
    assert.deepEqual(sample.mocks.res.send.firstCall.args[0].message, expectedMsg);
  });

  it(`Publishes the message to the topic and calls success`, () => {
    const expectedMsg = `Message published.`;
    const sample = getSample();

    return sample.program.publish(sample.mocks.req, sample.mocks.res)
      .then(() => {
        assert.deepEqual(sample.mocks.topic.publish.callCount, 1);
        assert.deepEqual(sample.mocks.topic.publish.firstCall.args, [{
          data: {
            message: MESSAGE
          }
        }]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [200]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [expectedMsg]);
      });
  });

  it(`Fails to publish the message and calls failure`, () => {
    const error = new Error(`error`);
    const sample = getSample();
    sample.mocks.topic.publish.returns(Promise.reject(error));

    return sample.program.publish(sample.mocks.req, sample.mocks.res)
      .then(() => {
        throw new Error(`Should have failed!`);
      })
      .catch((err) => {
        assert.deepEqual(err, error);
        assert.deepEqual(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [error]);
      });
  });

  it('Subscribes to a message', () => {
    const callback = sinon.stub();
    const event = {
      payload: {
        data: MESSAGE
      }
    };

    const sample = getSample();
    sample.program.subscribe(event, callback);

    assert.deepEqual(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [event.payload]);
    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });
});
