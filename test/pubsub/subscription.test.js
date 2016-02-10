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

var assert = require('assert');
var projectId = process.env.GCLOUD_PROJECT;

var subscriptionSample = require('../../pubsub/subscription');

describe('pubsub/subscription', function () {
  it('should run the sample', function (done) {
    this.timeout(30000);
    subscriptionSample.runSample(function (err, responses) {
      try {
        assert.ok(err === null);
        // topic
        var expectedTopic = 'projects/' + projectId + '/topics/messageCenter';
        assert.equal(responses[0][0].name, expectedTopic);
        assert.ok(responses[0][0].iam);
        // apiResponse
        assert.ok(responses[0][1]);
        // subscription
        assert.ok(responses[1][0].on);
        assert.ok(responses[1][0].iam);
        // apiResponse
        assert.ok(responses[1][1]);
        // topics
        var foundExpectedTopic = false;
        responses[2][0].forEach(function (topic) {
          if (topic.name === expectedTopic) {
            foundExpectedTopic = true;
            return false;
          }
        });
        assert.ok(foundExpectedTopic, 'topic should have been created!');
        assert.ok(responses[2][0][0].iam);
        // subscriptions
        assert.ok(responses[3][0][0].on);
        assert.ok(responses[3][0][0].iam);
        // messageIds
        assert.ok(typeof responses[4][0][0] === 'string');
        // apiResponse
        assert.ok(responses[4][1]);
        // messages
        assert.equal(responses[5][0][0].data, 'Hello, world!');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
