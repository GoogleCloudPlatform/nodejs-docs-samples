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

var landmarkDetectionSample = require('../../vision/landmarkDetection');

test.cb('should detect landmarks', function (t) {
  landmarkDetectionSample.main(
    'https://cloud-samples-tests.storage.googleapis.com/vision/water.jpg',
    function (err, landmarks) {
      t.ifError(err);
      t.ok(landmarks.length > 0);
      t.end();
    }
  );
});
