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
  proxyquire('../../pubsub/iam', {}).main(function (err, results) {
    t.ifError(err);
    t.is(results.length, 8);
    // Got topic and apiResponse
    t.is(results[0].length, 2);
    // Got policy and apiResponse
    t.is(results[1].length, 2);
    // Got permissions and apiResponse
    t.is(results[2].length, 2);
    // Got subscription and apiResponse
    t.is(results[3].length, 2);
    // Got policy and apiResponse
    t.is(results[4].length, 2);
    // Got permissions and apiResponse
    t.is(results[5].length, 2);
    // Got empty apiResponse
    t.deepEqual(results[6], {});
    // Got empty apiResponse
    t.deepEqual(results[7], {});
    t.end();
  });
});

test('getTopicPolicyExample: handles error', function (t) {
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
    t.is(err, 'error');
  });
});

test('getSubscriptionPolicyExample: handles error', function (t) {
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
    t.is(err, 'error');
  });
});

test('setTopicPolicyExample: sets topic policy', function (t) {
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
    t.ifError(err);
  });
});

test('setTopicPolicyExample: handles error', function (t) {
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
    t.is(err, 'error');
  });
});

test('setSubscriptionPolicyExample: sets subscription policy', function (t) {
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
    t.ifError(err);
  });
});

test('setSubscriptionPolicyExample: handles error', function (t) {
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
    t.is(err, 'error');
  });
});

test('testTopicPermissionsExample: handles error', function (t) {
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
    t.is(err, 'error');
  });
});

test('testSubscriptionPermissionsExample: handles error', function (t) {
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
    t.is(err, 'error');
  });
});
