// Copyright 2016 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Text Detection', () => {
  it('should detect texts', async () => {
    const inputDir = path.join(__dirname, '../resources');
    try {
      execSync(`node textDetection analyze ${inputDir}`);
    } catch (err) {
      if (err.stderr.match(/connect ECONNREFUSED/)) {
        console.error(
          '☣️ Redis is unavailable. Skipping vision textDetection test.'
        );
        return;
      }
      throw new Error(err.stderr);
    }

    const stdout = execSync('node textDetection lookup sunbeams');
    assert.match(stdout, /sunbeamkitties/);
  });
});
