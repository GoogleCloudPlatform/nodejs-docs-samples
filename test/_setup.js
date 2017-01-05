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

'use strict';

const childProcess = require(`child_process`);
const sinon = global.sinon = require(`sinon`);
const test = global.test = require(`ava`);

global.run = (cmd, cwd) => {
  return childProcess.execSync(cmd, { cwd: cwd }).toString().trim();
};

global.runAsync = (cmd, cwd, cb) => {
  childProcess.exec(cmd, { cwd: cwd }, cb);
};

global.stubConsole = () => {
  if (typeof console.log.restore !== `function` && typeof console.error.restore !== `function`) {
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
  }
};

global.restoreConsole = () => {
  if (typeof console.log.restore === `function`) {
    console.log.restore();
  }
  if (typeof console.error.restore === `function`) {
    console.error.restore();
  }
};

test.beforeEach((t) => {
  t.truthy(process.env.GCLOUD_PROJECT, `Must set GCLOUD_PROJECT environment variable!`);
  t.truthy(process.env.GOOGLE_APPLICATION_CREDENTIALS, `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`);
});
