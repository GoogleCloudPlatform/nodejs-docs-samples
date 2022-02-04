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
const sinon = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache();
const supertest = require('supertest');

const cwd = path.join(__dirname, '../');

const requestObj = supertest(proxyquire(path.join(cwd, 'server'), {process}));

const stubConsole = function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};

beforeEach(stubConsole);
afterEach(restoreConsole);

it('should send greetings', async () => {
  await requestObj
    .get('/')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello from App Engine!');
    });
});

describe('add_display_form', () => {
  it('should display form', async () => {
    await requestObj
      .get('/submit')
      .expect(200)
      .expect(response => {
        assert.strictEqual(
          response.text.includes(
            'textarea name="message" placeholder="Message"'
          ),
          true
        );
      });
  });
});

describe('add_post_handler enable_parser', () => {
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
});
