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

const path = require('path');
const assert = require('assert');
const utils = require('@google-cloud/nodejs-repo-tools');

const cwd = path.join(__dirname, '../');
const requestObj = utils.getRequest({
  cwd: cwd,
  cmd: 'server',
});

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

it('should send greetings', async () => {
  await requestObj
    .get('/')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello from App Engine!');
    });
});

it('should display form', async () => {
  await requestObj
    .get('/submit')
    .expect(200)
    .expect(response => {
      assert.strictEqual(
        response.text.includes('textarea name="message" placeholder="Message"'),
        true
      );
    });
});

it('should record message', async () => {
  await requestObj
    .post('/submit', {
      name: 'sample-user',
      message: 'sample-message',
    })
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Thanks for your message!');
    });
});
