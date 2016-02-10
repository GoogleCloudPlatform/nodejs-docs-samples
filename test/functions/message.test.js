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

var messageSample = require('../../functions/message');

describe('functions/message', function () {
  it('should print a message', function (done) {
    var testMessage = 'test message';
    var messageWasPrinted = false;
    var originalLog = console.log;

    console.log = function (data) {
      if (data === testMessage) {
        messageWasPrinted = true;
      }
    };

    messageSample.helloworld({
      success: function (result) {
        try {
          assert.equal(result, undefined);
          if (messageWasPrinted) {
            console.log = originalLog;
            done();
          } else {
            console.log = originalLog;
            done('message was not printed!');
          }
        } catch (err) {
          console.log = originalLog;
          done(err);
        }
      }
    }, {
      message: testMessage
    });
  });
  it('should say no message was providied', function (done) {
    messageSample.helloworld({
      failure: function (result) {
        try {
          assert.equal(result, 'No message defined!');
          done();
        } catch (err) {
          done(err);
        }
      }
    }, {});
  });
});
