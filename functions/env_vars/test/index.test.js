/**
 * Copyright 2016, Google, LLC.
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
const functions = require(`../`);

function getMocks () {
  const req = {};
  const res = {
    send: sinon.stub().returnsThis()
  };

  return {
    req: req,
    res: res
  };
}

test.serial(`should read env vars`, (t) => {
  const mocks = getMocks();
  process.env['FOO'] = 'bar';

  functions.envVar(mocks.req, mocks.res);

  t.true(mocks.res.send.calledWith('bar'));
});
