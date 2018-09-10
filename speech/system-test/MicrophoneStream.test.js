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

const path = require(`path`);
const test = require(`ava`);

const {runAsync} = require(`@google-cloud/nodejs-repo-tools`);
const cmd = `node MicrophoneStream.js`;
const cwd = path.join(__dirname, `..`);

test(`MicrophoneStream.js Should load and display Yaaaarghs(!) correctly`, async t => {
  const output = await runAsync(`${cmd} --help`, cwd);
  t.true(
    output.includes('Streams audio input from microphone, translates to text')
  );
});
