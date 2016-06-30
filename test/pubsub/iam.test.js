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

describe('pubsub:iam', function () {
  it('should run the sample', function (done) {
    proxyquire('../../pubsub/iam', {}).main(function (err, results) {
      assert(!err);
      assert(results.length === 8);
      // Got topic and apiResponse
      assert(results[0].length === 2);
      // Got policy and apiResponse
      assert(results[1].length === 2);
      // Got permissions and apiResponse
      assert(results[2].length === 2);
      // Got subscription and apiResponse
      assert(results[3].length === 2);
      // Got policy and apiResponse
      assert(results[4].length === 2);
      // Got permissions and apiResponse
      assert(results[5].length === 2);
      // Got empty apiResponse
      assert.deepEqual(results[6], {});
      // Got empty apiResponse
      assert.deepEqual(results[7], {});
      assert(console.log.calledWith('Created topic messageCenter2'));
      assert(console.log.calledWith('Got permissions for messageCenter2'));
      assert(console.log.calledWith('Subscribed to messageCenter2'));
      assert(console.log.calledWith('Got permissions for newMessages2'));
      assert(console.log.calledWith('Deleted subscription newMessages2'));
      assert(console.log.calledWith('Deleted topic messageCenter2'));
      done();
    });
  });

  describe('getTopicPolicyExample', function () {
    it('handles error', function () {
      var topic = {
        iam: {
          getPolicy: sinon.stub().callsArgWith(0, 'error')
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            topic: sinon.stub().returns(topic)
          }
        }
      }).getTopicPolicyExample('test-topic', function (err) {
        assert(err === 'error');
      });
    });
  });

  describe('getSubscriptionPolicyExample', function () {
    it('handles error', function () {
      var subscription = {
        iam: {
          getPolicy: sinon.stub().callsArgWith(0, 'error')
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            subscription: sinon.stub().returns(subscription)
          }
        }
      }).getSubscriptionPolicyExample('test-subscription', function (err) {
        assert(err === 'error');
      });
    });
  });

  describe('setTopicPolicyExample', function () {
    it('sets topic policy', function () {
      var policy = {};
      var apiResponse = {};
      var topic = {
        iam: {
          setPolicy: sinon.stub().callsArgWith(1, null, policy, apiResponse)
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            topic: sinon.stub().returns(topic)
          }
        }
      }).setTopicPolicyExample('test-topic', function (err, policy, apiResponse) {
        assert(!err);
        assert(console.log.calledWith('Updated policy for test-topic'));
      });
    });

    it('handles error', function () {
      var topic = {
        iam: {
          setPolicy: sinon.stub().callsArgWith(1, 'error')
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            topic: sinon.stub().returns(topic)
          }
        }
      }).setTopicPolicyExample('test-topic', function (err) {
        assert(err === 'error');
      });
    });
  });

  describe('setSubscriptionPolicyExample', function () {
    it('sets subscription policy', function () {
      var policy = {};
      var apiResponse = {};
      var subscription = {
        iam: {
          setPolicy: sinon.stub().callsArgWith(1, null, policy, apiResponse)
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            subscription: sinon.stub().returns(subscription)
          }
        }
      }).setSubscriptionPolicyExample('test-subscription', function (err, policy, apiResponse) {
        assert(!err);
        assert(console.log.calledWith('Updated policy for test-subscription'));
      });
    });

    it('handles error', function () {
      var subscription = {
        iam: {
          setPolicy: sinon.stub().callsArgWith(1, 'error')
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            subscription: sinon.stub().returns(subscription)
          }
        }
      }).setSubscriptionPolicyExample('test-subscription', function (err) {
        assert(err === 'error');
      });
    });
  });

  describe('testTopicPermissionsExample', function () {
    it('handles error', function () {
      var topic = {
        iam: {
          testPermissions: sinon.stub().callsArgWith(1, 'error')
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            topic: sinon.stub().returns(topic)
          }
        }
      }).testTopicPermissionsExample('test-topic', function (err) {
        assert(err === 'error');
      });
    });
  });

  describe('testSubscriptionPermissionsExample', function () {
    it('handles error', function () {
      var subscription = {
        iam: {
          testPermissions: sinon.stub().callsArgWith(1, 'error')
        }
      };
      proxyquire('../../pubsub/iam', {
        './subscription': {
          pubsub: {
            subscription: sinon.stub().returns(subscription)
          }
        }
      }).testSubscriptionPermissionsExample('test-subscription', function (err) {
        assert(err === 'error');
      });
    });
  });
});
