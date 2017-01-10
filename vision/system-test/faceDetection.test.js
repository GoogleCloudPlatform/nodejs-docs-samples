/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

require(`../../system-test/_setup`);

const fs = require(`fs`);
const path = require(`path`);

class MockCanvas {
  getContext () {
    return {
      drawImage: () => {},
      beginPath: () => {},
      lineTo: () => {},
      stroke: () => {}
    };
  }

  pngStream () {
    return {
      on: (event, cb) => {
        if (event === 'end') {
          setTimeout(cb, 1000);
        } else if (event === `data`) {
          cb(`test`);
          cb(`foo`);
          cb(`bar`);
        }
      }
    };
  }
}

MockCanvas.Image = class Image {};

const faceDetectionExample = require(`../faceDetection`);
const inputFile = path.join(__dirname, `../resources`, `face.png`);
const outputFile = path.join(__dirname, `../../vision`, `out.png`);

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should detect faces`, (t) => {
  faceDetectionExample.main(inputFile, outputFile, MockCanvas, (err, faces) => {
    t.ifError(err);
    t.is(faces.length, 1);
    const image = fs.readFileSync(outputFile);
    t.is(image.toString(`utf8`), `testfoobar`);
    t.true(console.log.calledWith(`Found 1 face`));
    t.true(console.log.calledWith(`Highlighting...`));
    t.true(console.log.calledWith(`Finished!`));
    t.end();
  });
});
