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
var inputDir = path.join(__dirname, '../resources');
var textDetectionSample = require('../textDetection');

describe('vision:textDetection', function () {
  it('should detect texts', function (done) {
    textDetectionSample.main(inputDir, function (err, textResponse) {
      assert.ifError(err);
      assert(Object.keys(textResponse).length > 0);
      textDetectionSample.lookup(['the', 'sunbeams', 'in'], function (err, hits) {
        assert.ifError(err);
        assert(hits.length > 0);
        assert(hits[0].length > 0);
        done();
      });
    });
  });
});
