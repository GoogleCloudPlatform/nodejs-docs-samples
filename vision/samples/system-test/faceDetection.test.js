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

const fs = require(`fs`);
const path = require(`path`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);

class MockCanvas {
  getContext() {
    return {
      drawImage: () => {},
      beginPath: () => {},
      lineTo: () => {},
      stroke: () => {},
    };
  }

  pngStream() {
    return {
      on: (event, cb) => {
        if (event === 'end') {
          setTimeout(cb, 1000);
        } else if (event === `data`) {
          /* eslint-disable */
          cb(`test`);
          cb(`foo`);
          cb(`bar`);
          /* eslint-enable */
        }
      },
    };
  }
}

MockCanvas.Image = class Image {};

const faceDetectionExample = require(`../faceDetection`);
const inputFile = path.join(__dirname, `../resources`, `face.png`);
const outputFile = path.join(__dirname, `../../vision`, `out.png`);

describe(`face detection`, () => {
  before(tools.checkCredentials);
  before(tools.stubConsole);

  after(tools.restoreConsole);

  it(`should detect faces`, async () => {
    let done = false;
    const timeout = setTimeout(() => {
      if (!done) {
        console.warn('Face detection timed out!');
      }
    }, 60);

    faceDetectionExample.main(
      inputFile,
      outputFile,
      MockCanvas,
      (err, faces) => {
        assert.ifError(err);
        assert.strictEqual(faces.length, 1);

        const image = fs.readFileSync(outputFile);
        assert.strictEqual(image.toString(`utf8`), `testfoobar`);
        assert.ok(console.log.calledWith(`Found 1 face`));
        assert.ok(console.log.calledWith(`Highlighting...`));
        assert.ok(console.log.calledWith(`Finished!`));
        done = true;
        clearTimeout(timeout);
      }
    );
  });
});
