/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://cloud.google.com/video-intelligence/docs/

'use strict';
var fs = require('fs');

const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node speak.js`;
const cwd = path.join(__dirname, `..`);

const ssmlString = `"<?xml version=\\"1.0\\"?> \\\n` +
  `<speak version=\\"1.0\\" xmlns=\\"http://www.w3.org/2001/10/synthesis\\" \\\n` +
  `  xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" \\\n` +
  `  xsi:schemaLocation=\\"http://www.w3.org/2001/10/synthesis \\\n` +
  `  http://www.w3.org/TR/speech-synthesis/synthesis.xsd\\" xml:lang=\\"en-US\\"> \\\n` +
  `   Hello there. \\\n` +
  ` </speak>"`;

// Always wipe output.mp3 during tests as it's created for speech synthesis.
test.before(async () => {
  if (fs.existsSync(`output.mp3`)) {
    fs.unlink(`output.mp3`);
  }
});

// Test list voices returns the expected data.
test(`should list voices`, async (t) => {
  const output = await tools.runAsync(`${cmd} list-voices "" ""`, cwd);
  t.regex(output, /Name:/);
  t.regex(output, /Gender:/);
  t.regex(output, /Languages:/);
  t.regex(output, /Rate Hz:/);
});

// Test text synthesis.
test.after.always(async () => {
  fs.unlink(`output.mp3`);
});
test(`should synthesize text`, async (t) => {
  await tools.runAsync(`${cmd} synthesize "Please take me with you!"`, cwd);
  t.is(fs.existsSync(`output.mp3`), true);
});

test(`should synthesize ssml`, async (t) => {
  await tools.runAsync(`${cmd} synthesize-ssml ${ssmlString}`, cwd);
  t.is(fs.existsSync(`output.mp3`), true);
});

// Test file text synthesis.
test(`should list voices`, async (t) => {
  await tools.runAsync(`${cmd} synthesize-file resources/text.txt`, cwd);
  t.is(fs.existsSync(`output.mp3`), true);
});

// Test file SSML synthesis.
test(`should list voices`, async (t) => {
  await tools.runAsync(`${cmd} synthesize-ssmlFile resources/ssml.xml`, cwd);
  t.is(fs.existsSync(`output.mp3`), true);
});
