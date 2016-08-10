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

var fs = require('fs');
var path = require('path');

function MockCanvas () {
  this.getContext = function () {
    return {
      drawImage: function () {},
      beginPath: function () {},
      lineTo: function () {},
      stroke: function () {}
    };
  };
  this.pngStream = function () {
    return {
      on: function (event, cb) {
        if (event === 'end') {
          setTimeout(function () {
            cb();
          }, 1000);
        } else if (event === 'data') {
          cb('test');
          cb('foo');
          cb('bar');
        }
      }
    };
  };
}

MockCanvas.Image = function () {};

var faceDetectionExample = require('../faceDetection');
var inputFile = path.join(__dirname, '../resources', 'face.png');
var outputFile = path.join(__dirname, '../../vision', 'out.png');

describe('vision:faceDetection', function () {
  it('should detect faces', function (done) {
    faceDetectionExample.main(
      inputFile,
      outputFile,
      MockCanvas,
      function (err, faces) {
        assert.ifError(err);
        assert(faces.length === 1);
        var image = fs.readFileSync(outputFile);
        assert(image.toString('utf8') === 'testfoobar');
        assert(console.log.calledWith('Found 1 face'));
        assert(console.log.calledWith('Highlighting...'));
        assert(console.log.calledWith('Finished!'));
        done();
      }
    );
  });
});
