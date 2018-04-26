/**
 * Copyright 2018, Google, Inc.
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

const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const sample = require(`../`);

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test(`should demonstrate error type behavior`, (t) => {
  const objError = new Error('Error object!');
  const strError = new Error('Error string!');

  const req = { body:
    { throwAsString: true }
  };
  const res = { end: sinon.stub() };

  // Test throwing both objects and strings
  sample.errorTypes(req, res);
  t.deepEqual(console.error.getCall(0).args, [objError]);
  t.deepEqual(console.error.getCall(1).args, [strError]);

  // Test throwing objects only
  req.body.throwAsString = false;
  sample.errorTypes(req, res);
  t.deepEqual(console.error.getCall(2).args, [objError]);
  t.deepEqual(console.error.getCall(3).args, [objError]);
});
