// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require(`path`);
const test = require(`ava`);
const utils = require(`@google-cloud/nodejs-repo-tools`);

const cwd = path.join(__dirname, `../`);
const requestObj = utils.getRequest({
  cwd: cwd,
  cmd: `server`,
});

test.beforeEach(utils.stubConsole);
test.afterEach.always(utils.restoreConsole);

test.cb.serial(`should send greetings`, t => {
  requestObj
    .get(`/`)
    .expect(200)
    .expect(response => {
      t.is(response.text, `Hello from App Engine!`);
    })
    .end(t.end);
});

test.cb.serial(`should display form`, t => {
  requestObj
    .get(`/submit`)
    .expect(200)
    .expect(response => {
      t.true(
        response.text.includes('textarea name="message" placeholder="Message"')
      );
    })
    .end(t.end);
});

test.cb.serial(`should record message`, t => {
  requestObj
    .post(`/submit`, {
      name: `sample-user`,
      message: `sample-message`,
    })
    .expect(200)
    .expect(response => {
      t.is(response.text, `Thanks for your message!`);
    })
    .end(t.end);
});
