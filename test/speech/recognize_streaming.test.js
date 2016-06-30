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
var recognizeExample = require('../../speech/recognize_streaming');

describe('speech:recognize_streaming', function () {
  it('should list entries', function (done) {
    recognizeExample.main(
      path.join(__dirname, '../../speech/resources/audio.raw'),
      function (err, results) {
        assert(!err);
        assert(results);
        assert(results.length === 1);
        assert(results[0].results);
        assert(console.log.calledWith('Got audio file!'));
        assert(console.log.calledWith('Loading speech service...'));
        assert(console.log.calledWith('Analyzing speech...'));
        done();
      }
    );
  });
});
