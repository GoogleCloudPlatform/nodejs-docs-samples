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
var projectId = process.env.TEST_PROJECT_ID;

var iamSample = require('../../pubsub/iam');

describe('pubsub/iam', function () {
  it('should run the sample', function (done) {
    this.timeout(30000);
    iamSample.runSample(function (err, responses) {
      try {
        assert.ok(err === null);
        // topic
        var expectedTopic = 'projects/' + projectId + '/topics/messageCenter';
        assert.equal(responses[0][0].name, expectedTopic);
        assert.ok(responses[0][0].iam);
        // apiResponse
        assert.ok(responses[0][1]);
        // policy
        assert.deepEqual(responses[1][0], { etag: 'ACAB' });
        // apiResponse
        assert.ok(responses[1][1]);
        // permissions
        assert.deepEqual(responses[2][0], {
          'pubsub.topics.attachSubscription': true,
          'pubsub.topics.publish': true,
          'pubsub.topics.update': true
        });
        // apiResponse
        assert.ok(responses[2][1]);
        // subscription
        assert.ok(responses[3][0].on);
        assert.ok(responses[3][0].iam);
        // apiResponse
        assert.ok(responses[3][1]);
        // policy
        assert.deepEqual(responses[4][0], { etag: 'ACAB' });
        // apiResponse
        assert.ok(responses[4][1]);
        // permissions
        assert.deepEqual(responses[5][0], {
          'pubsub.subscriptions.consume': true,
          'pubsub.subscriptions.update': true
        });
        // apiResponse
        assert.ok(responses[5][1]);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
