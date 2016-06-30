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

var proxyquire = require('proxyquire');

describe('pubsub:subscription', function () {
  it('should run the sample', function (done) {
    proxyquire('../../pubsub/subscription', {}).main(function (err, results) {
      assert(!err);
      assert(results.length === 8);
      // Got topic and apiResponse
      assert(results[0].length === 2);
      // Got subscription and apiResponse
      assert(results[1].length === 2);
      // Got array of topics
      assert(Array.isArray(results[2]));
      // Got array of subscriptions
      assert(Array.isArray(results[3]));
      // Got messageIds and apiResponse
      assert(results[4].length === 2);
      // Got array of messages
      assert(Array.isArray(results[5]));
      // Got empty apiResponse
      assert.deepEqual(results[6], {});
      // Got empty apiResponse
      assert.deepEqual(results[7], {});
      assert(console.log.calledWith('Created topic messageCenter'));
      assert(console.log.calledWith('Subscribed to messageCenter'));
      assert(console.log.calledWith('Published 1 messages'));
      assert(console.log.calledWith('received message: Hello, world!'));
      assert(console.log.calledWith('Pulled 1 messages'));
      assert(console.log.calledWith('Deleted subscription newMessages'));
      assert(console.log.calledWith('Deleted topic messageCenter'));
      done();
    });
  });

  describe('createTopicExample', function () {
    it('handles error', function () {
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
        assert(err === 'error');
      });
    });
  });

  describe('deleteTopicExample', function () {
    it('handles error', function () {
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
        assert(err === 'error');
      });
    });
  });

  describe('deleteSubscriptionExample', function () {
    it('handles error', function () {
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
        assert(err === 'error');
      });
    });
  });

  describe('publishExample', function () {
    it('handles error', function () {
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
        assert(err === 'error');
      });
    });
  });

  describe('getAllTopicsExample', function () {
    it('handles error', function () {
      var pubsub = {
        getTopics: sinon.stub().callsArgWith(1, 'error')
      };
      proxyquire('../../pubsub/subscription', {
        gcloud: {
          pubsub: sinon.stub().returns(pubsub)
        }
      }).getAllTopicsExample(function (err) {
        assert(err === 'error');
      });
    });

    it('recurses', function () {
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
        assert(!err);
        assert.deepEqual(topics, []);
      });
    });

    it('handles deep error', function () {
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
        assert(err === 'error');
      });
    });
  });

  describe('getAllSubscriptionsExample', function () {
    it('handles error', function () {
      var pubsub = {
        getSubscriptions: sinon.stub().callsArgWith(1, 'error')
      };
      proxyquire('../../pubsub/subscription', {
        gcloud: {
          pubsub: sinon.stub().returns(pubsub)
        }
      }).getAllSubscriptionsExample(function (err) {
        assert(err === 'error');
      });
    });

    it('recurses', function () {
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
        assert(!err);
        assert.deepEqual(subscriptions, []);
      });
    });

    it('handles deep error', function () {
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
        assert(err === 'error');
      });
    });
  });

  describe('subscribeExample', function () {
    it('handles error', function () {
      var pubsub = {
        subscribe: sinon.stub().callsArgWith(3, 'error')
      };
      proxyquire('../../pubsub/subscription', {
        gcloud: {
          pubsub: sinon.stub().returns(pubsub)
        }
      }).subscribeExample('test-topic', 'test-subscription', function (err) {
        assert(err === 'error');
      });
    });
  });
});
