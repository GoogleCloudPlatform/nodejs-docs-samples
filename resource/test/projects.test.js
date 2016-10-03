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

const proxyquire = require(`proxyquire`).noCallThru();

describe(`resource:projects`, () => {
  it(`should handle errors`, () => {
    const error = new Error(`error`);
    const callback = sinon.spy();
    const resourceMock = {
      getProjects: sinon.stub().yields(error)
    };
    const ResourceMock = sinon.stub().returns(resourceMock);
    const program = proxyquire(`../projects`, {
      '@google-cloud/resource': ResourceMock
    });

    program.listProjects(callback);

    assert.equal(callback.callCount, 1);
    assert.equal(callback.alwaysCalledWithExactly(error), true);
  });
});
