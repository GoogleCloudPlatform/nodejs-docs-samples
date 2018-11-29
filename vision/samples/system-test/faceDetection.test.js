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

const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const cmd = `node faceDetection.js`;
const cwd = path.join(__dirname, `..`);
const inputFile = path.join(__dirname, '../resources', 'face.png');
const outputFile = path.join(__dirname, '../../', 'out.png');

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
    const output = await tools.runAsync(
      `${cmd}  ${inputFile} ${outputFile}`,
      cwd
    );
    assert.ok(output.includes('Found 1 face'));
    assert.ok(output.includes('Highlighting...'));
    assert.ok(output.includes('Finished!'));
    done = true;
    clearTimeout(timeout);
  });
});
