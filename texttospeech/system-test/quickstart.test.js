/**
 * Copyright 2017, Google, Inc.
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

const outputFile = `output.mp3`;
const cmd = `node quickstart.js`;
const cwd = path.join(__dirname, `..`);

test.before(tools.stubConsole);
test.after.always(tools.restoreConsole);
test.after.always(async () => {
  await fs.unlink(outputFile);
});

test(`should synthesize speech to local mp3 file`, async t => {
  t.false(fs.existsSync(outputFile));
  const output = await tools.runAsync(`${cmd}`, cwd);
  t.true(output.includes(`Audio content written to file: output.mp3`));
  t.true(fs.existsSync(outputFile));
});
