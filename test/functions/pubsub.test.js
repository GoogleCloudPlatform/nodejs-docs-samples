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

var test = require('ava');
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();

function getSample () {
  var topic = {
    publish: sinon.stub().callsArg(1)
  };
  var pubsub = {
    topic: sinon.stub().returns(topic)
  };
  var gcloud = {
    pubsub: sinon.stub().returns(pubsub)
  };
  return {
    sample: proxyquire('../../functions/pubsub', {
      gcloud: gcloud
    }),
    mocks: {
      gcloud: gcloud,
      pubsub: pubsub,
      topic: topic
    }
  };
}

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

test('Publish fails without a topic', function (t) {
  var expectedMsg = 'Topic not provided. Make sure you have a "topic" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.publish(context, {
    message: 'message'
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.calledWith(expectedMsg), true);
  t.is(context.success.called, false);
});

test('Publish fails without a message', function (t) {
  var expectedMsg = 'Message not provided. Make sure you have a "message" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.publish(context, {
    topic: 'topic'
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.calledWith(expectedMsg), true);
  t.is(context.success.called, false);
});

test('Publishes the message to the topic and calls success', function (t) {
  var expectedMsg = 'Message published';
  var data = {
    topic: 'topic',
    message: 'message'
  };
  var context = getMockContext();

  var pubsubSample = getSample();
  pubsubSample.sample.publish(context, data);

  t.is(context.success.calledOnce, true);
  t.is(context.success.calledWith(expectedMsg), true);
  t.is(context.failure.called, false);
  t.is(pubsubSample.mocks.pubsub.topic.calledOnce, true);
  t.is(pubsubSample.mocks.pubsub.topic.calledWith(data.topic), true);
  t.is(pubsubSample.mocks.topic.publish.calledOnce, true);
  t.is(pubsubSample.mocks.topic.publish.calledWith({
    data: {
      message: data.message
    }
  }), true);
});

test('Fails to publish the message and calls failure', function (t) {
  var expectedMsg = 'error';
  var data = {
    topic: 'topic',
    message: 'message'
  };
  var context = getMockContext();

  var pubsubSample = getSample();
  pubsubSample.mocks.topic.publish = sinon.stub().callsArgWith(1, expectedMsg);

  pubsubSample.sample.publish(context, data);

  t.is(context.success.called, false);
  t.is(context.failure.calledOnce, true);
  t.is(context.failure.calledWith(expectedMsg), true);
  t.is(pubsubSample.mocks.pubsub.topic.calledOnce, true);
  t.is(pubsubSample.mocks.pubsub.topic.calledWith(data.topic), true);
  t.is(pubsubSample.mocks.topic.publish.calledOnce, true);
  t.is(pubsubSample.mocks.topic.publish.calledWith({
    data: {
      message: data.message
    }
  }), true);
});

test('Subscribes to a message', function (t) {
  var expectedMsg = 'message';
  var data = {
    topic: 'topic',
    message: expectedMsg
  };
  var context = getMockContext();

  var pubsubSample = getSample();
  sinon.spy(console, 'log');

  pubsubSample.sample.subscribe(context, data);

  t.is(console.log.calledOnce, true);
  t.is(console.log.calledWith(expectedMsg), true);
  t.is(context.success.calledOnce, true);
  t.is(context.failure.called, false);

  console.log.restore();
});
