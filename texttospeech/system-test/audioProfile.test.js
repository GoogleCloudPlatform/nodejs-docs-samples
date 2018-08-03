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

const cmd = `node audioProfile.js`;
const cwd = path.join(__dirname, `..`);
const text = `Hello Everybody!  This is an Audio Profile Optimized Sound Byte.`;
const outputFile1 = `phonetest.mp3`;
const outputFile2 = `homeTheatreTest.mp3`;
const outputFile3 = `carAudioTest.mp3`;
const outputFile4 = `watchAudioTest.mp3`;

test.before(tools.checkCredentials);

test.after(async () => {
  await fs.unlink(outputFile1);
  await fs.unlink(outputFile2);
  await fs.unlink(outputFile3);
  await fs.unlink(outputFile4);
});

test(`Should synthesize Speech for Telephone Audio Profile`, async t => {
  t.false(fs.existsSync(outputFile1));
  const output = await tools.runAsync(
    `${cmd} synthesize '${text}' -f '${outputFile1}' -e telephony-class-application`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile1}`));
  t.true(fs.existsSync(outputFile1));
});

test(`Should synthesize Speech for Home Theatre Audio Profile`, async t => {
  t.false(fs.existsSync(outputFile2));
  const output = await tools.runAsync(
    `${cmd} synthesize '${text}' -f '${outputFile2}' -e large-home-entertainment-class-device`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile2}`));
  t.true(fs.existsSync(outputFile2));
});

test(`Should synthesize Speech for Car Audio Audio Profile`, async t => {
  t.false(fs.existsSync(outputFile3));
  const output = await tools.runAsync(
    `${cmd} synthesize '${text}' -f '${outputFile3}' -e large-automotive-class-device`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile3}`));
  t.true(fs.existsSync(outputFile3));
});

test(`should synthesize Speech for Watch Audio Profile`, async t => {
  t.false(fs.existsSync(outputFile4));
  const output = await tools.runAsync(
    `${cmd} synthesize '${text}' -f '${outputFile4}' -e wearable-class-device`,
    cwd
  );
  t.true(output.includes(`Audio content written to file: ${outputFile4}`));
  t.true(fs.existsSync(outputFile4));
});
