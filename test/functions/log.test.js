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
var logSample = require('../../functions/log');

test.cb('should write to log', function (t) {
  var logMessage = 'I am a log entry!';
  var messageWasPrinted = false;

  console.log = function (data) {
    if (data === logMessage) {
      messageWasPrinted = true;
    }
  };

  logSample.log({
    success: function (result) {
      t.is(result, undefined);
      if (messageWasPrinted) {
        t.end();
      } else {
        t.end('message was not printed!');
      }
    }
  });
});
test.cb('should write to log 2', function (t) {
  var logMessage = 'My GCF Function: foo';
  var messageWasPrinted = false;

  console.log = function (data) {
    if (data === logMessage) {
      messageWasPrinted = true;
    }
  };

  logSample.helloworld({
    success: function (result) {
      t.is(result, undefined);
      if (messageWasPrinted) {
        t.end();
      } else {
        t.end('message was not printed!');
      }
    }
  },
  {
    message: 'foo'
  });
});
test.cb('should write to log 3', function (t) {
  var logMessage = 'My GCF Function: foo';
  logSample.hellohttp({
    success: function (result) {
      t.is(result, logMessage);
      t.end();
    }
  },
  {
    message: 'foo'
  });
});
