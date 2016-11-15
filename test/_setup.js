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

const assert = require(`assert`);
const sinon = global.sinon = require(`sinon`);
const test = global.test = require(`ava`);
const child_process = require(`child_process`);

global.run = (cmd, cwd) => {
  return child_process.execSync(cmd, { cwd: cwd }).toString().trim();
};

global.runAsync = (cmd, cwd, cb) => {
  child_process.exec(cmd, { cwd: cwd }, cb);
};

global.stubConsole = () => {
  if (process.env.DEBUG) {
    sinon.spy(console, `error`);
    sinon.spy(console, `log`);
  } else {
    sinon.stub(console, `error`);
    sinon.stub(console, `log`, (a, b, c) => {
      if (typeof a === `string` && a.indexOf(`\u001b`) !== -1 && typeof b === `string`) {
        console.log.apply(console, arguments);
      }
    });
  }
};

test.beforeEach((t) => {
  assert(process.env.GCLOUD_PROJECT, `Must set GCLOUD_PROJECT environment variable!`);
  assert(process.env.GOOGLE_APPLICATION_CREDENTIALS, `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`);
});
