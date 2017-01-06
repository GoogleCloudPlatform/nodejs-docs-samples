/**
 * Copyright 2016, Google, Inc.
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

require(`../../../test/_setup`);

const proxyquire = require('proxyquire').noCallThru();
const program = proxyquire(`../`, {});

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.serial(`helloworld: should log a message`, (t) => {
  const expectedMsg = `My Cloud Function: hi`;
  const callback = sinon.stub();

  program.helloWorld({
    data: {
      message: `hi`
    }
  }, callback);

  t.deepEqual(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [expectedMsg]);
  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, []);
});

test.cb.serial(`helloGET: should print hello world`, (t) => {
  const expectedMsg = `Hello World!`;

  program.helloGET({}, {
    send: (message) => {
      t.is(message, expectedMsg);
      t.end();
    }
  });
});

test.cb.serial(`helloHttp: should print a name`, (t) => {
  const expectedMsg = `Hello John!`;

  program.helloHttp({
    body: {
      name: `John`
    }
  }, {
    send: (message) => {
      t.is(message, expectedMsg);
      t.end();
    }
  });
});

test.cb.serial(`helloHttp: should print hello world`, (t) => {
  const expectedMsg = `Hello World!`;

  program.helloHttp({
    body: {}
  }, {
    send: (message) => {
      t.is(message, expectedMsg);
      t.end();
    }
  });
});

test.serial(`helloBackground: should print a name`, (t) => {
  const expectedMsg = `Hello John!`;
  const callback = sinon.stub();

  program.helloBackground({
    data: {
      name: `John`
    }
  }, callback);

  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, [null, expectedMsg]);
});

test.serial(`helloBackground: should print hello world`, (t) => {
  const expectedMsg = `Hello World!`;
  const callback = sinon.stub();

  program.helloBackground({ data: {} }, callback);

  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, [null, expectedMsg]);
});

test.serial(`helloPubSub: should print a name`, (t) => {
  const expectedMsg = `Hello Bob!`;
  const callback = sinon.stub();

  program.helloPubSub({
    data: {
      data: new Buffer(`Bob`).toString(`base64`)
    }
  }, callback);

  t.deepEqual(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [expectedMsg]);
  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, []);
});

test.serial(`helloPubSub: should print hello world`, (t) => {
  const expectedMsg = `Hello World!`;
  const callback = sinon.stub();

  program.helloPubSub({ data: {} }, callback);

  t.deepEqual(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [expectedMsg]);
  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, []);
});

test.serial(`helloGCS: should print uploaded message`, (t) => {
  const expectedMsg = `File foo uploaded.`;
  const callback = sinon.stub();

  program.helloGCS({
    data: {
      name: `foo`,
      resourceState: `exists`
    }
  }, callback);

  t.deepEqual(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [expectedMsg]);
  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, []);
});

test.serial(`helloGCS: should print deleted message`, (t) => {
  const expectedMsg = `File foo deleted.`;
  const callback = sinon.stub();

  program.helloGCS({
    data: {
      name: `foo`,
      resourceState: `not_exists`
    }
  }, callback);

  t.deepEqual(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [expectedMsg]);
  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, []);
});

test.serial(`helloError: should throw an error`, (t) => {
  const expectedMsg = `I failed you`;

  t.throws(() => {
    program.helloError();
  }, Error, expectedMsg);
});

test.serial(`helloError2: should throw a value`, (t) => {
  t.throws(() => {
    program.helloError2();
  });
});

test.serial(`helloError3: callback shoud return an errback value`, (t) => {
  const expectedMsg = `I failed you`;
  const callback = sinon.stub();

  program.helloError3({}, callback);

  t.deepEqual(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, [expectedMsg]);
});

