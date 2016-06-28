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
    sample: proxyquire('../../functions/log', {
      googleapis: {
        auth: auth,
        monitoring: sinon.stub().returns(monitoring)
      },
      gcloud: {
        logging: sinon.stub().returns(logging)
      }
    }),
    mocks: {
      auth: auth,
      monitoring: monitoring,
      logging: logging
    }
  };
}

test.before(function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
});

test('should write to log', function (t) {
  var expectedMsg = 'I am a log entry!';
  getSample().sample.helloWorld({
    success: function (result) {
      t.is(result, undefined);
      t.is(console.log.called, true);
      t.is(console.log.calledWith(expectedMsg), true);
    },
    failure: t.fail
  });
});

test('retrieve: should retrieve logs', function (t) {
  var logSample = getSample();
  logSample.sample.retrieve();
  t.is(console.log.calledWith('entries'), true);
});

test('retrieve: handles error', function (t) {
  var expectedMsg = 'entries error';
  var logSample = getSample();
  logSample.mocks.logging.getEntries = sinon.stub().callsArgWith(1, expectedMsg);
  logSample.sample.retrieve();
  t.is(console.error.calledWith(expectedMsg), true);
});

test('getMetrics: should retrieve metrics', function (t) {
  var logSample = getSample();
  logSample.sample.getMetrics();
  t.is(console.log.calledWith('series'), true);
});

test('getMetrics: creates with scope', function (t) {
  var authClient = {
    createScopedRequired: sinon.stub().returns(true),
    createScoped: sinon.stub().returns('foo')
  };
  var logSample = getSample();
  logSample.mocks.auth.getApplicationDefault = sinon.stub().callsArgWith(0, null, authClient);
  logSample.sample.getMetrics();
  t.deepEqual(authClient.createScoped.firstCall.args[0], [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/monitoring',
    'https://www.googleapis.com/auth/monitoring.read',
    'https://www.googleapis.com/auth/monitoring.write'
  ]);
});

test('getMetrics: handles auth error', function (t) {
  var expectedMsg = 'auth error';
  var logSample = getSample();
  logSample.mocks.auth.getApplicationDefault = sinon.stub().callsArgWith(0, expectedMsg);
  logSample.sample.getMetrics();
  t.is(console.error.calledWith('Authentication failed', expectedMsg), true);
});

test('getMetrics: handles time series error', function (t) {
  var expectedMsg = 'time series error';
  var logSample = getSample();
  logSample.mocks.monitoring.projects.timeSeries.list = sinon.stub().callsArgWith(1, expectedMsg);
  logSample.sample.getMetrics();
  t.is(console.error.calledWith(expectedMsg), true);
});

test.after(function () {
  console.error.restore();
  console.log.restore();
});
