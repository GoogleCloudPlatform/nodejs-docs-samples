// Copyright 2015-2016, Google, Inc.
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
var proxyquire = require('proxyquire').noPreserveCache();
var request = require('supertest');

test.cb('should log error', function (t) {
  var loggerCalled = false;

  var structuredLogger = {
    emit: function (name) {
      loggerCalled = true;
      t.is(name, 'errors');
    }
  };

  var app = proxyquire('../../logging/fluent.js', {
    'fluent-logger': {
      createFluentSender: function (name, options) {
        t.is(name, 'myapp');
        t.deepEqual(options, {
          host: 'localhost',
          port: 24224,
          timeout: 3.0
        });
        return structuredLogger;
      }
    }
  });

  request(app)
    .get('/')
    .expect(500)
    .expect(function () {
      t.is(loggerCalled, true, 'structuredLogger.emit should have been called');
    })
    .end(t.end);
});
