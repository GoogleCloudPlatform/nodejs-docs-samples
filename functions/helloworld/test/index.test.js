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
var helloworldSample = proxyquire('../', {});

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

describe('functions:helloworld', function () {
  it('helloworld: should log a message', function () {
    var expectedMsg = 'My Cloud Function: hi';
    var context = getMockContext();
    helloworldSample.helloWorld(context, {
      message: 'hi'
    });

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.failure.called, false);
    assert.equal(console.log.calledWith(expectedMsg), true);
  });

  it('helloGET: should print hello world', function (done) {
    var expectedMsg = 'Hello World!';
    helloworldSample.helloGET({}, {
      send: function (message) {
        assert.equal(message, expectedMsg);
        done();
      }
    });
  });

  it('helloHttp: should print a name', function (done) {
    var expectedMsg = 'Hello John!';
    helloworldSample.helloHttp({
      body: {
        name: 'John'
      }
    }, {
      send: function (message) {
        assert.equal(message, expectedMsg);
        done();
      }
    });
  });

  it('helloHttp: should print hello world', function (done) {
    var expectedMsg = 'Hello World!';
    helloworldSample.helloHttp({
      body: {}
    }, {
      send: function (message) {
        assert.equal(message, expectedMsg);
        done();
      }
    });
  });

  it('helloBackground: should print a name', function () {
    var expectedMsg = 'Hello John!';
    var context = getMockContext();
    helloworldSample.helloBackground(context, {
      name: 'John'
    });

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.success.firstCall.args[0], expectedMsg);
    assert.equal(context.failure.called, false);
  });

  it('helloBackground: should print hello world', function () {
    var expectedMsg = 'Hello World!';
    var context = getMockContext();
    helloworldSample.helloBackground(context, {});

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.success.firstCall.args[0], expectedMsg);
    assert.equal(context.failure.called, false);
  });

  it('helloPubSub: should print a name', function () {
    var expectedMsg = 'Hello Bob!';
    var context = getMockContext();
    helloworldSample.helloPubSub(context, {
      name: 'Bob'
    });

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.failure.called, false);
    assert.equal(console.log.calledWith(expectedMsg), true);
  });

  it('helloPubSub: should print hello world', function () {
    var expectedMsg = 'Hello World!';
    var context = getMockContext();
    helloworldSample.helloPubSub(context, {});

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.failure.called, false);
    assert.equal(console.log.calledWith(expectedMsg), true);
  });

  it('helloGCS: should print a name', function () {
    var expectedMsg = 'Hello Sally!';
    var context = getMockContext();
    helloworldSample.helloGCS(context, {
      name: 'Sally'
    });

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.failure.called, false);
    assert.equal(console.log.calledWith(expectedMsg), true);
  });

  it('helloGCS: should print hello world', function () {
    var expectedMsg = 'Hello World!';
    var context = getMockContext();
    helloworldSample.helloGCS(context, {});

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.failure.called, false);
    assert.equal(console.log.calledWith(expectedMsg), true);
  });
});

