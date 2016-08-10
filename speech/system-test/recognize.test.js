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
var recognizeExample = require('../recognize');

describe('speech:recognize', function () {
  it('should recognize speech in audio', function (done) {
    recognizeExample.main(
      path.join(__dirname, '../resources/audio.raw'),
      function (err, result) {
        assert.ifError(err);
        assert(result);
        assert(Array.isArray(result.results));
        assert(result.results.length === 1);
        assert(result.results[0].alternatives);
        assert(console.log.calledWith('Got audio file!'));
        assert(console.log.calledWith('Analyzing speech...'));
        done();
      }
    );
  });
});
