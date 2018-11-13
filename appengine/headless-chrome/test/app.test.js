// Copyright 2017, Google, Inc.
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

const test = require(`ava`);
const path = require(`path`);
const utils = require(`@google-cloud/nodejs-repo-tools`);

const cwd = path.join(__dirname, `../`);
const requestObj = utils.getRequest({cwd: cwd});

test.serial.cb(`should return a screenshot`, t => {
  requestObj
    .get(`/?url=https://example.com`)
    .send()
    .expect(200)
    .expect(response => {
      t.is(response.type, `image/png`);
      t.true(response.body instanceof Buffer);
      t.true(response.body.length > 0);
    })
    .end(t.end);
});
