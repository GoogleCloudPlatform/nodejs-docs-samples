// Copyright 2018 Google LLC
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

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const {existsSync, unlinkSync} = require('node:fs');
const path = require('node:path');

const {after, beforeEach, describe, it} = require('mocha');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cmd = 'node synthesize.js';
const text = 'Hello there.';
const ssml = '<speak>Hello there.</speak>';
const outputFile = 'test-output.mp3';
const files = ['hello.txt', 'hello.ssml'].map(name => {
  return {
    name,
    localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
  };
});

function removeOutput() {
  try {
    // Remove if outputFile exists
    unlinkSync(outputFile);
  } catch {
    // OK to ignore error if outputFile doesn't exist already
  }
}

describe('synthesize', () => {
  // Remove file if it already exists
  beforeEach(() => {
    removeOutput();
  });

  // Remove file after testing
  after(() => {
    removeOutput();
  });

  it('should synthesize audio from text', () => {
    assert.equal(existsSync(outputFile), false);
    const output = execSync(`${cmd} text '${text}' --outputFile ${outputFile}`);
    assert.ok(
      new RegExp(`Audio content written to file: ${outputFile}`).test(output)
    );
    assert.ok(existsSync(outputFile));
  });

  it('should synthesize audio from ssml', () => {
    assert.equal(existsSync(outputFile), false);
    const output = execSync(`${cmd} ssml "${ssml}" --outputFile ${outputFile}`);
    assert.ok(
      new RegExp(`Audio content written to file: ${outputFile}`).test(output)
    );
    assert.ok(existsSync(outputFile));
  });

  it('should synthesize audio from text file', () => {
    assert.equal(existsSync(outputFile), false);
    const output = execSync(
      `${cmd} text-file ${files[0].localPath} --outputFile ${outputFile}`
    );
    assert.ok(
      new RegExp(`Audio content written to file: ${outputFile}`).test(output)
    );
    assert.ok(existsSync(outputFile));
  });

  it('should synthesize audio from ssml file', () => {
    assert.equal(existsSync(outputFile), false);
    const output = execSync(
      `${cmd} ssml-file ${files[1].localPath} --outputFile ${outputFile}`
    );
    assert.ok(
      new RegExp(`Audio content written to file: ${outputFile}`).test(output)
    );
    assert.ok(existsSync(outputFile));
  });
});
