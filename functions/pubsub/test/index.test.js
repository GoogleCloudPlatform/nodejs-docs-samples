// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var proxyquire = require('proxyquire').noCallThru();

function getSample () {
  var topicMock = {
    publish: sinon.stub().callsArg(1)
  };
  var pubsubMock = {
    topic: sinon.stub().returns(topicMock)
  };
  var PubSubMock = sinon.stub().returns(pubsubMock);
  return {
    sample: proxyquire('../', {
      '@google-cloud/pubsub': PubSubMock
    }),
    mocks: {
      PubSub: PubSubMock,
      pubsub: pubsubMock,
      topic: topicMock
    }
  };
}

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

describe('functions:pubsub', function () {
  it('Publish fails without a topic', function () {
    var expectedMsg = 'Topic not provided. Make sure you have a "topic" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.publish(context, {
      message: 'message'
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('Publish fails without a message', function () {
    var expectedMsg = 'Message not provided. Make sure you have a "message" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.publish(context, {
      topic: 'topic'
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('Publishes the message to the topic and calls success', function () {
    var expectedMsg = 'Message published';
    var data = {
      topic: 'topic',
      message: 'message'
    };
    var context = getMockContext();

    var pubsubSample = getSample();
    pubsubSample.sample.publish(context, data);

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.success.firstCall.args[0], expectedMsg);
    assert.equal(context.failure.called, false);
    assert.equal(pubsubSample.mocks.pubsub.topic.calledOnce, true);
    assert.deepEqual(pubsubSample.mocks.pubsub.topic.firstCall.args[0], data.topic);
    assert.equal(pubsubSample.mocks.topic.publish.calledOnce, true);
    assert.deepEqual(pubsubSample.mocks.topic.publish.firstCall.args[0], {
      data: {
        message: data.message
      }
    });
  });

  it('Fails to publish the message and calls failure', function () {
    var expectedMsg = 'error';
    var data = {
      topic: 'topic',
      message: 'message'
    };
    var context = getMockContext();

    var pubsubSample = getSample();
    pubsubSample.mocks.topic.publish = sinon.stub().callsArgWith(1, expectedMsg);

    pubsubSample.sample.publish(context, data);

    assert.equal(context.success.called, false);
    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(pubsubSample.mocks.pubsub.topic.calledOnce, true);
    assert.deepEqual(pubsubSample.mocks.pubsub.topic.firstCall.args[0], data.topic);
    assert.equal(pubsubSample.mocks.topic.publish.calledOnce, true);
    assert.deepEqual(pubsubSample.mocks.topic.publish.firstCall.args[0], {
      data: {
        message: data.message
      }
    });
  });

  it('Subscribes to a message', function () {
    var expectedMsg = 'message';
    var data = {
      topic: 'topic',
      message: expectedMsg
    };
    var context = getMockContext();

    var pubsubSample = getSample();

    pubsubSample.sample.subscribe(context, data);

    assert.equal(console.log.called, true);
    assert.equal(console.log.calledWith(expectedMsg), true);
    assert.equal(context.success.calledOnce, true);
    assert.equal(context.failure.called, false);
  });
});
