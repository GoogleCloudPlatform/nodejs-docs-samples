/**
 * Copyright 2018, Google, Inc.
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

/* eslint-disable */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node synthesize.js';
const cwd = path.join(__dirname, '..');
const text = 'Hello there.';
const ssml = '<speak>Hello there.</speak>';
const outputFile = 'test-output.mp3';
const files = ['hello.txt', 'hello.ssml'].map(name => {
  return {
    name,
    localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
  };
});

before(tools.checkCredentials);

afterEach(() => {
  try {
    fs.unlinkSync(outputFile);
  } catch(err) {
  // Ignore error
  }
});

it('should synthesize audio from text', async () => {
  assert.strictEqual(fs.existsSync(outputFile), false);
  const output = await tools.runAsync(
    `${cmd} text '${text}' --outputFile ${outputFile}`,
    cwd
  );
  assert.ok(output.includes(`Audio content written to file: ${outputFile}`));
  assert.ok(fs.existsSync(outputFile));
});

it('should synthesize audio from ssml', async () => {
  assert.strictEqual(fs.existsSync(outputFile), false);
  const output = await tools.runAsync(
    `${cmd} ssml "${ssml}" --outputFile ${outputFile}`,
    cwd
  );
  assert.ok(output.includes(`Audio content written to file: ${outputFile}`));
  assert.ok(fs.existsSync(outputFile));
});

it('should synthesize audio from text file', async () => {
  assert.strictEqual(fs.existsSync(outputFile), false);
  const output = await tools.runAsync(
    `${cmd} text-file ${files[0].localPath} --outputFile ${outputFile}`,
    cwd
  );
  assert.ok(output.includes(`Audio content written to file: ${outputFile}`));
  assert.ok(fs.existsSync(outputFile));
});

it('should synthesize audio from ssml file', async () => {
  assert.strictEqual(fs.existsSync(outputFile), false);
  const output = await tools.runAsync(
    `${cmd} ssml-file ${files[1].localPath} --outputFile ${outputFile}`,
    cwd
  );
  assert.ok(output.includes(`Audio content written to file: ${outputFile}`));
  assert.ok(fs.existsSync(outputFile));
});
