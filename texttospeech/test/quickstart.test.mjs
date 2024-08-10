// Copyright 2024 Google LLC
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

import assert from 'node:assert/strict';
import {existsSync, unlinkSync} from 'node:fs';
import * as cp from 'node:child_process';

import {after, beforeEach, describe, it} from 'mocha';

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const outputFile = 'quickstart_output.mp3';

function removeOutput() {
  try {
    // Remove if outputFile exists
    unlinkSync(outputFile);
  } catch {
    // OK to ignore error if outputFile doesn't exist already
  }
}

describe('quickstart', () => {
  // Remove file if it exists
  beforeEach(() => {
    removeOutput();
  });

  // Remove file after testing
  after(() => {
    removeOutput();
  });

  it('should synthesize speech to local mp3 file', () => {
    // Verifies that outputFile doesn't exist
    assert.equal(
      existsSync(outputFile),
      false,
      `found pre-existing ${outputFile}, please rename or remove and retry the test`
    );
    const output = execSync('node quickstart.mjs');
    assert.ok(
      new RegExp(`Audio content written to file: ${outputFile}`).test(output)
    );
    assert.ok(existsSync(outputFile));
  });
});
