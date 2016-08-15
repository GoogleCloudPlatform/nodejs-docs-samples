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

var authClient = {};

function getSample () {
  var auth = {
    getApplicationDefault: sinon.stub().callsArgWith(0, null, authClient)
  };
  var monitoring = {
    projects: {
      timeSeries: {
        list: sinon.stub().callsArgWith(1, null, {
          timeSeries: 'series'
        })
      }
    }
  };
  var logging = {
    getEntries: sinon.stub().callsArgWith(1, null, 'entries')
  };
  return {
    sample: proxyquire('../', {
      googleapis: {
        auth: auth,
        monitoring: sinon.stub().returns(monitoring)
      },
      '@google-cloud/logging': sinon.stub().returns(logging)
    }),
    mocks: {
      auth: auth,
      monitoring: monitoring,
      logging: logging
    }
  };
}

describe('functions:log', function () {
  it('should write to log', function () {
    var expectedMsg = 'I am a log entry!';
    getSample().sample.helloWorld({
      success: function (result) {
        assert.equal(result, undefined);
        assert.equal(console.log.called, true);
        assert.equal(console.log.calledWith(expectedMsg), true);
      },
      failure: assert.fail
    });
  });

  it('retrieve: should retrieve logs', function () {
    var logSample = getSample();
    logSample.sample.retrieve();
    assert.equal(console.log.calledWith('entries'), true);
  });

  it('retrieve: handles error', function () {
    var expectedMsg = 'entries error';
    var logSample = getSample();
    logSample.mocks.logging.getEntries = sinon.stub().callsArgWith(1, expectedMsg);
    logSample.sample.retrieve();
    assert.equal(console.error.calledWith(expectedMsg), true);
  });

  it('getMetrics: should retrieve metrics', function () {
    var logSample = getSample();
    logSample.sample.getMetrics();
    assert.equal(console.log.calledWith('series'), true);
  });

  it('getMetrics: creates with scope', function () {
    var authClient = {
      createScopedRequired: sinon.stub().returns(true),
      createScoped: sinon.stub().returns('foo')
    };
    var logSample = getSample();
    logSample.mocks.auth.getApplicationDefault = sinon.stub().callsArgWith(0, null, authClient);
    logSample.sample.getMetrics();
    assert.deepEqual(authClient.createScoped.firstCall.args[0], [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/monitoring',
      'https://www.googleapis.com/auth/monitoring.read',
      'https://www.googleapis.com/auth/monitoring.write'
    ]);
  });

  it('getMetrics: handles auth error', function () {
    var expectedMsg = 'auth error';
    var logSample = getSample();
    logSample.mocks.auth.getApplicationDefault = sinon.stub().callsArgWith(0, expectedMsg);
    logSample.sample.getMetrics();
    assert.equal(console.error.calledWith('Authentication failed', expectedMsg), true);
  });

  it('getMetrics: handles time series error', function () {
    var expectedMsg = 'time series error';
    var logSample = getSample();
    logSample.mocks.monitoring.projects.timeSeries.list = sinon.stub().callsArgWith(1, expectedMsg);
    logSample.sample.getMetrics();
    assert.equal(console.error.calledWith(expectedMsg), true);
  });
});

