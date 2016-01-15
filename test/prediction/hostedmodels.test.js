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
var hostedmodels = require('../../prediction/hostedmodels');

var EXPECTED_RESULT = {
  kind: 'prediction#output',
  id: 'sample.sentiment',
  selfLink: 'https://www.googleapis.com/prediction/v1.6/projects/414649711441' +
    '/hostedmodels/sample.sentiment/predict',
  outputLabel: 'positive',
  outputMulti: [
    { label: 'positive', score: '0.784671' },
    { label: 'negative', score: '0.186649' },
    { label: 'neutral', score: '0.028680' }
  ]
};

describe('prediction/hostedmodels', function () {
  it('should predict', function (done) {
    hostedmodels.predict(function (err, result) {
      if (err) {
        return done(err);
      }
      assert.deepEqual(result, EXPECTED_RESULT);
      done();
    });
  });
});
