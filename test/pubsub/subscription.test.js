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
var proxyquire = require('proxyquire');

test.cb.serial('should run the sample', function (t) {
  proxyquire('../../pubsub/subscription', {}).main(function (err, results) {
    t.ifError(err);
    t.is(results.length, 8);
    // Got topic and apiResponse
    t.is(results[0].length, 2);
    // Got subscription and apiResponse
    t.is(results[1].length, 2);
    // Got array of topics
    t.truthy(Array.isArray(results[2]));
    // Got array of subscriptions
    t.truthy(Array.isArray(results[3]));
    // Got messageIds and apiResponse
    t.is(results[4].length, 2);
    // Got array of messages
    t.truthy(Array.isArray(results[5]));
    // Got empty apiResponse
    t.deepEqual(results[6], {});
    // Got empty apiResponse
    t.deepEqual(results[7], {});
    t.end();
  });
});

test('createTopicExample: handles error', function (t) {
  var topic = {
    get: sinon.stub().callsArgWith(1, 'error')
  };
  var pubsub = {
    topic: sinon.stub().returns(topic)
  };
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).createTopicExample('test-topic', function (err) {
    t.is(err, 'error');
  });
});

test('deleteTopicExample: handles error', function (t) {
  var topic = {
    delete: sinon.stub().callsArgWith(0, 'error')
  };
  var pubsub = {
    topic: sinon.stub().returns(topic)
  };
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).deleteTopicExample('test-topic', function (err) {
    t.is(err, 'error');
  });
});

test('deleteSubscriptionExample: handles error', function (t) {
  var subscription = {
    delete: sinon.stub().callsArgWith(0, 'error')
  };
  var pubsub = {
    subscription: sinon.stub().returns(subscription)
  };
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).deleteSubscriptionExample('test-subscription', function (err) {
    t.is(err, 'error');
  });
});

test('publishExample: handles error', function (t) {
  var topic = {
    publish: sinon.stub().callsArgWith(1, 'error')
  };
  var pubsub = {
    topic: sinon.stub().returns(topic)
  };
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).publishExample('test-topic', function (err) {
    t.is(err, 'error');
  });
});

test('getAllTopicsExample: handles error', function (t) {
  var pubsub = {
    getTopics: sinon.stub().callsArgWith(1, 'error')
  };
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).getAllTopicsExample(function (err) {
    t.is(err, 'error');
  });
});

test('getAllTopicsExample: recurses', function (t) {
  var pubsub = {
    getTopics: sinon.stub().callsArgWith(1, 'error')
  };
  pubsub.getTopics.onFirstCall().callsArgWith(1, null, [], {
    token: '1234'
  });
  pubsub.getTopics.onSecondCall().callsArgWith(1, null, []);
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).getAllTopicsExample(function (err, topics) {
    t.ifError(err);
    t.deepEqual(topics, []);
  });
});

test('getAllTopicsExample: handles deep error', function (t) {
  var pubsub = {
    getTopics: sinon.stub().callsArgWith(1, 'error')
  };
  pubsub.getTopics.onFirstCall().callsArgWith(1, null, [], {
    token: '1234'
  });
  pubsub.getTopics.onSecondCall().callsArgWith(1, 'error');
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).getAllTopicsExample(function (err) {
    t.is(err, 'error');
  });
});

test('getAllSubscriptionsExample: handles error', function (t) {
  var pubsub = {
    getSubscriptions: sinon.stub().callsArgWith(1, 'error')
  };
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).getAllSubscriptionsExample(function (err) {
    t.is(err, 'error');
  });
});

test('getAllSubscriptionsExample: recurses', function (t) {
  var pubsub = {
    getSubscriptions: sinon.stub().callsArgWith(1, 'error')
  };
  pubsub.getSubscriptions.onFirstCall().callsArgWith(1, null, [], {
    token: '1234'
  });
  pubsub.getSubscriptions.onSecondCall().callsArgWith(1, null, []);
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).getAllSubscriptionsExample(function (err, subscriptions) {
    t.ifError(err);
    t.deepEqual(subscriptions, []);
  });
});

test('getAllSubscriptionsExample: handles deep error', function (t) {
  var pubsub = {
    getSubscriptions: sinon.stub().callsArgWith(1, 'error')
  };
  pubsub.getSubscriptions.onFirstCall().callsArgWith(1, null, [], {
    token: '1234'
  });
  pubsub.getSubscriptions.onSecondCall().callsArgWith(1, 'error');
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).getAllSubscriptionsExample(function (err) {
    t.is(err, 'error');
  });
});

test('subscribeExample: handles error', function (t) {
  var pubsub = {
    subscribe: sinon.stub().callsArgWith(3, 'error')
  };
  proxyquire('../../pubsub/subscription', {
    gcloud: {
      pubsub: sinon.stub().returns(pubsub)
    }
  }).subscribeExample('test-topic', 'test-subscription', function (err) {
    t.is(err, 'error');
  });
});
