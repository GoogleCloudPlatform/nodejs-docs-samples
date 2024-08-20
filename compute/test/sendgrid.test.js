// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const proxyquire = require('proxyquire');
const {assert} = require('chai');

process.env.SENDGRID_API_KEY = 'foo';

describe('sendgrid', () => {
  it('should send an email', () => {
    proxyquire('../sendgrid', {
      '@sendgrid/mail': {
        setApiKey: key => {
          assert.strictEqual(key, 'foo');
        },
        send: msg => {
          assert.deepStrictEqual(msg, {
            to: 'to_email@example.com',
            from: 'from_email@example.com',
            subject:
              'Sendgrid test email from Node.js on Google Cloud Platform',
            text: 'Well hello! This is a Sendgrid test email from Node.js on Google Cloud Platform.',
          });
        },
      },
    });
  });
});
