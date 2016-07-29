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
  var requestPromise = sinon.stub().returns(new Promise(function (resolve) {
    resolve('test');
  }));
  return {
    sample: proxyquire('../', {
      'request-promise': requestPromise
    }),
    mocks: {
      requestPromise: requestPromise
    }
  };
}

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

describe('functions:background', function () {
  it('should echo message', function () {
    var expectedMsg = 'hi';
    var context = getMockContext();
    var backgroundSample = getSample();
    backgroundSample.sample.helloWorld(context, {
      message: expectedMsg
    });

    assert(context.success.calledOnce);
    assert.equal(context.failure.called, false);
    assert(console.log.calledWith(expectedMsg));
  });
  it('should say no message was provided', function () {
    var expectedMsg = 'No message defined!';
    var context = getMockContext();
    var backgroundSample = getSample();
    backgroundSample.sample.helloWorld(context, {});

    assert(context.failure.calledOnce);
    assert(context.failure.firstCall.args[0] === expectedMsg);
    assert.equal(context.success.called, false);
  });
  it('should make a promise request', function (done) {
    var backgroundSample = getSample();
    backgroundSample.sample.helloPromise({
      endpoint: 'foo.com'
    }).then(function (result) {
      assert.deepEqual(backgroundSample.mocks.requestPromise.firstCall.args[0], {
        uri: 'foo.com'
      });
      assert.equal(result, 'test');
      done();
    }, function () {
      assert.fail();
    });
  });
  it('should return synchronously', function () {
    var backgroundSample = getSample();
    assert(backgroundSample.sample.helloSynchronous({
      something: true
    }) === 'Something is true!');
  });
  it('should throw an error', function () {
    var backgroundSample = getSample();
    assert.throws(function () {
      backgroundSample.sample.helloSynchronous({
        something: false
      });
    }, Error, 'Something was not true!');
  });
});
