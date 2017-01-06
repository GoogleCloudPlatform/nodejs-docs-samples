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
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, { cwd: cwd }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      if (stdout) {
        resolve(stdout.toString().trim());
      } else {
        resolve(stdout);
      }
    });
  });
};

class Try {
  constructor (test) {
    this._maxTries = 10;
    this._maxDelay = 20000;
    this._timeout = 60000;
    this._iteration = 1;
    this._multiplier = 1.3;
    this._delay = 500;
    this._test = test;
  }

  execute () {
    if (this._iteration >= this._maxTries) {
      this.reject(this._error || new Error('Reached maximum number of tries'));
      return;
    } else if ((Date.now() - this._start) >= this._timeout) {
      this.reject(this._error || new Error('Test timed out'));
      return;
    }

    try {
      this._test();
      this.resolve();
    } catch (err) {
      this._error = err;
      this._iteration++;
      this._delay = Math.min(this._delay * this._multiplier, this._maxDelay);
      setTimeout(() => this.execute(), this._delay);
    }
  }

  timeout (timeout) {
    this._timeout = timeout;
  }

  tries (maxTries) {
    this._maxTries = maxTries;
  }

  start () {
    this._start = Date.now();
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.execute();
    });
    return this.promise;
  }
}

global.tryTest = (test) => {
  return new Try(test);
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
