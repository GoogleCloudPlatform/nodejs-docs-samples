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

const proxyquire = require(`proxyquire`).noPreserveCache();
const resource = proxyquire(`@google-cloud/resource`, {})();

describe(`resource:quickstart`, () => {
  let resourceMock, ResourceMock;

  it(`should list projects`, (done) => {
    resourceMock = {
      getProjects: (_callback) => {
        assert.equal(typeof _callback, 'function');

        resource.getProjects((err, projects) => {
          _callback(err, projects);
          assert.ifError(err);
          assert.equal(Array.isArray(projects), true);
          assert.equal(console.log.called, true);
          assert.deepEqual(console.log.firstCall.args, [`Projects:`]);
          projects.forEach((project, i) => {
            assert.deepEqual(console.log.getCall(i + 1).args, [project.id]);
          });
          done();
        });
      }
    };
    ResourceMock = sinon.stub().returns(resourceMock);

    proxyquire(`../quickstart`, {
      '@google-cloud/resource': ResourceMock
    });
  });
});
