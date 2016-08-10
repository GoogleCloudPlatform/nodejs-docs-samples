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

var path = require('path');
var recognizeExample = require('../recognize_streaming');

describe('speech:recognize_streaming', function () {
  it('should recognize audio', function (done) {
    recognizeExample.main(
      path.join(__dirname, '../resources/audio.raw'),
      process.env.SPEECH_API_HOST || 'speech.googleapis.com',
      function (err, results) {
        assert.ifError(err);
        assert(results);
        assert(results.length === 3);
        assert(results[0].results);
        assert(results[1].results);
        assert(results[2].results);
        assert(results[2].results.length === 1);
        assert(console.log.calledWith('Loading speech service...'));
        assert(console.log.calledWith('Analyzing speech...'));
        done();
      }
    );
  });
});
