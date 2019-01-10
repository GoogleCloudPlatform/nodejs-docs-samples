/**
 * Copyright 2018, Google, LLC.
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

const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const runSample = `'require("./basic-job-sample").runSample()'`;

test(`Should create a company, create 20 jobs, list jobs in created company, and batch delete jobs using previously received list.`, async t => {
  const output = await tools.runAsync(`node -e ${runSample}`);
  const pattern =
    `.*Company generated:.*\n` +
    `.*Job created:.*\n` +
    `.*Job existed:.*\n` + //! Needs changing, looks like it's using the return string for success
    `.*Job deleted.*`;

  t.regex(output, new RegExp(pattern));
});
