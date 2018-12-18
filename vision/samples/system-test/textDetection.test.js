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
const {assert} = require('chai');
const execa = require('execa');

describe(`Text Detection`, () => {
  it(`should detect texts`, async () => {
    const inputDir = path.join(__dirname, `../resources`);
    const result = await execa.shell(`node textDetection analyze ${inputDir}`, {
      reject: false,
    });
    if (result.stderr) {
      if (result.stderr.match(/connect ECONNREFUSED/)) {
        console.error(
          '☣️ Redis is unavailable. Skipping vision textDetection test.'
        );
        return true;
      }
      throw new Error(result.stderr);
    }
    const {stdout} = await execa.shell('node textDetection lookup sunbeams');
    assert.match(stdout, /sunbeamkitties/);
  });
});
