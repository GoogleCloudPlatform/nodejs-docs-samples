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

const fs = require(`fs`);
const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node synthesize.js`;
const cwd = path.join(__dirname, `..`);
const text = `Hello there.`;
const ssml = `<speak>Hello there.</speak>`;
const outputFile = `test-output.mp3`;
const files = [`hello.txt`, `hello.ssml`].map(name => {
  return {
    name,
    localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
  };
});

test.before(tools.checkCredentials);

test.after.always(async () => {
  await fs.unlink(outputFile);
});

test(`should synthesize audio from text`, async t => {
  t.false(fs.existsSync(outputFile));
  const output = await tools.runAsync(
    `${cmd} text '${text}' --outputFile '${outputFile}'`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile}`));
  t.true(fs.existsSync(outputFile));
});

test(`should synthesize audio from ssml`, async t => {
  t.false(fs.existsSync(outputFile));
  const output = await tools.runAsync(
    `${cmd} ssml '${ssml}' --outputFile '${outputFile}'`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile}`));
  t.true(fs.existsSync(outputFile));
});

test(`should synthesize audio from text file`, async t => {
  t.false(fs.existsSync(outputFile));
  const output = await tools.runAsync(
    `${cmd} text-file '${files[0].localPath}' --outputFile '${outputFile}'`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile}`));
  t.true(fs.existsSync(outputFile));
});

test(`should synthesize audio from ssml file`, async t => {
  t.false(fs.existsSync(outputFile));
  const output = await tools.runAsync(
    `${cmd} ssml-file '${files[1].localPath}' --outputFile '${outputFile}'`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile}`));
  t.true(fs.existsSync(outputFile));
});
