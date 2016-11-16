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

const proxyquire = require('proxyquire').noCallThru();
const program = proxyquire(`../`, {});

describe(`functions:helloworld`, () => {
  it(`helloworld: should log a message`, () => {
    const expectedMsg = `My Cloud Function: hi`;
    const callback = sinon.stub();

    program.helloWorld({
      data: {
        message: `hi`
      }
    }, callback);

    assert.deepEqual(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [expectedMsg]);
    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });

  it(`helloGET: should print hello world`, (done) => {
    const expectedMsg = `Hello World!`;

    program.helloGET({}, {
      send: (message) => {
        assert.equal(message, expectedMsg);
        done();
      }
    });
  });

  it(`helloHttp: should print a name`, (done) => {
    const expectedMsg = `Hello John!`;

    program.helloHttp({
      body: {
        name: `John`
      }
    }, {
      send: (message) => {
        assert.equal(message, expectedMsg);
        done();
      }
    });
  });

  it(`helloHttp: should print hello world`, (done) => {
    const expectedMsg = `Hello World!`;

    program.helloHttp({
      body: {}
    }, {
      send: (message) => {
        assert.equal(message, expectedMsg);
        done();
      }
    });
  });

  it(`helloBackground: should print a name`, () => {
    const expectedMsg = `Hello John!`;
    const callback = sinon.stub();

    program.helloBackground({
      data: {
        name: `John`
      }
    }, callback);

    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, [null, expectedMsg]);
  });

  it(`helloBackground: should print hello world`, () => {
    const expectedMsg = `Hello World!`;
    const callback = sinon.stub();

    program.helloBackground({ data: {} }, callback);

    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, [null, expectedMsg]);
  });

  it(`helloPubSub: should print a name`, () => {
    const expectedMsg = `Hello Bob!`;
    const callback = sinon.stub();

    program.helloPubSub({
      data: {
        data: new Buffer(`Bob`).toString(`base64`)
      }
    }, callback);

    assert.deepEqual(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [expectedMsg]);
    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });

  it(`helloPubSub: should print hello world`, () => {
    const expectedMsg = `Hello World!`;
    const callback = sinon.stub();

    program.helloPubSub({ data: {} }, callback);

    assert.deepEqual(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [expectedMsg]);
    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });

  it(`helloGCS: should print uploaded message`, () => {
    const expectedMsg = `File foo uploaded.`;
    const callback = sinon.stub();

    program.helloGCS({
      data: {
        name: `foo`,
        resourceState: `exists`
      }
    }, callback);

    assert.deepEqual(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [expectedMsg]);
    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });

  it(`helloGCS: should print deleted message`, () => {
    const expectedMsg = `File foo deleted.`;
    const callback = sinon.stub();

    program.helloGCS({
      data: {
        name: `foo`,
        resourceState: `not_exists`
      }
    }, callback);

    assert.deepEqual(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [expectedMsg]);
    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });

  it(`helloError: should throw an error`, () => {
    const expectedMsg = `I failed you`;

    assert.throws(() => {
      program.helloError();
    }, Error, expectedMsg);
  });

  it(`helloError2: should throw a value`, () => {
    assert.throws(() => {
      program.helloError2();
    });
  });

  it(`helloError3: callback shoud return an errback value`, () => {
    const expectedMsg = `I failed you`;
    const callback = sinon.stub();

    program.helloError3({}, callback);

    assert.deepEqual(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, [expectedMsg]);
  });
});

