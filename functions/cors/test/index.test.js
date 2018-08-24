/**
 * Copyright 2018, Google, LLC.
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
  const mainReq = {
    method: 'GET'
  };

  const preflightReq = {
    method: 'OPTIONS'
  };

  const res = {
    set: sinon.stub(),
    removeHeader: sinon.stub(),
    send: sinon.stub().returnsThis(),
    status: sinon.stub().returnsThis()
  };

  return {
    mainReq: mainReq,
    preflightReq: preflightReq,
    res: res
  };
}

test.serial(`should respond to preflight request (no auth)`, (t) => {
  const mocks = getMocks();

  functions.corsEnabledFunction(mocks.preflightReq, mocks.res);

  t.true(mocks.res.status.calledOnceWith(204));
  t.true(mocks.res.send.called);
});

test.serial(`should respond to main request (no auth)`, (t) => {
  const mocks = getMocks();

  functions.corsEnabledFunction(mocks.mainReq, mocks.res);

  t.true(mocks.res.send.calledOnceWith(`Hello World!`));
});

test.serial(`should respond to preflight request (auth)`, (t) => {
  const mocks = getMocks();

  functions.corsEnabledFunctionAuth(mocks.preflightReq, mocks.res);

  t.true(mocks.res.status.calledOnceWith(204));
  t.true(mocks.res.send.called);
});

test.serial(`should respond to main request (auth)`, (t) => {
  const mocks = getMocks();

  functions.corsEnabledFunctionAuth(mocks.mainReq, mocks.res);

  t.true(mocks.res.send.calledOnceWith(`Hello World!`));
});
