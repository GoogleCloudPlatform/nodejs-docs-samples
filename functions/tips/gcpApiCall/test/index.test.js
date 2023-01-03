// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const {getFunction} = require('@google-cloud/functions-framework/testing');

describe('functions_tips_gcp_apis', () => {
  it('should send status 200 when PubSub publish callback error is falsy', () => {
    class PubSubMock {
      constructor() {
        this.topic = sinon.stub().returns({
          publishMessage: function (payload, callback) {
            callback(null); //`callback` accepts: error
          },
        });
      }
    }
    proxyquire('..', {'@google-cloud/pubsub': {PubSub: PubSubMock}});
    const reqMock = {
      body: {topic: 'topic-name'},
    };
    const resMock = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };
    const gcpApiCall = getFunction('gcpApiCall');
    gcpApiCall(reqMock, resMock);

    assert.ok(resMock.status.calledOnce);
    assert.ok(resMock.status.calledWith(200));
    assert.ok(resMock.send.calledOnce);
    assert.ok(resMock.send.calledWith('1 message published'));
  });

  it('should send status 500 when PubSub publish callback error is truthy', () => {
    class PubSubMock {
      constructor() {
        this.topic = sinon.stub().returns({
          publishMessage: function (payload, callback) {
            callback('Testing failure mode'); //`callback` accepts: error
          },
        });
      }
    }
    proxyquire('..', {'@google-cloud/pubsub': {PubSub: PubSubMock}});
    const reqMock = {
      body: {topic: 'topic-name'},
    };
    const resMock = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };
    const gcpApiCall = getFunction('gcpApiCall');
    gcpApiCall(reqMock, resMock);

    assert.ok(resMock.status.calledOnce);
    assert.ok(resMock.status.calledWith(500));
    assert.ok(resMock.send.calledOnce);
  });
});
