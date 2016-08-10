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

var landmarkDetectionSample = require('../landmarkDetection');
var inputFile = 'https://cloud-samples-tests.storage.googleapis.com/vision/water.jpg';

describe('vision:landmarkDetection', function () {
  it('should detect landmarks', function (done) {
    landmarkDetectionSample.main(inputFile, function (err, landmarks) {
      assert.ifError(err);
      assert(landmarks.length > 0);
      assert(console.log.calledWith('Found landmark: Taitung, Famous Places "up the water flow" marker for ' + inputFile));
      done();
    });
  });
});
