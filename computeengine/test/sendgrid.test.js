// Copyright 2015-2016, Google, Inc.
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

var proxyquire = require('proxyquire').noPreserveCache();
process.env.SENDGRID_API_KEY = 'foo';

describe('computeengine:sendgrid', function () {
  it('should send an email', function (done) {
    proxyquire('../sendgrid', {
      sendgrid: function (key) {
        assert.equal(key, 'foo');
        return {
          emptyRequest: function (x) {
            return x;
          },
          API: function (request, cb) {
            assert.deepEqual(request, {
              method: 'POST',
              path: '/v3/mail/send',
              body: {
                personalizations: [{
                  to: [{ email: 'to_email@example.com' }],
                  subject: 'Sendgrid test email from Node.js on Google Cloud Platform'
                }],
                from: { email: 'from_email@example.com' },
                content: [{
                  type: 'text/plain',
                  value: 'Hello!\n\nThis a Sendgrid test email from Node.js on Google Cloud Platform.'
                }]
              }
            });
            done();
          }
        };
      }
    });
  });
});
