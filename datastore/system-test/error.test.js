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

const error = require('../error');
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test(`should have an error`, async (t) => {
  const err = await t.throws(error.runQuery());
  t.truthy(err);
  t.is(err.code, 400);
});
