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

require(`../../system-test/_setup`);

const proxyquire = require(`proxyquire`).noPreserveCache();
const resource = proxyquire(`@google-cloud/resource`, {})();

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should list projects`, (t) => {
  const resourceMock = {
    getProjects: () => {
      return resource.getProjects()
        .then(([projects]) => {
          t.true(Array.isArray(projects));

          setTimeout(() => {
            try {
              t.true(console.log.called);
              t.deepEqual(console.log.firstCall.args, [`Projects:`]);
              projects.forEach((project, i) => {
                t.deepEqual(console.log.getCall(i + 1).args, [project.id]);
              });
              t.end();
            } catch (err) {
              t.end(err);
            }
          }, 200);

          return [projects];
        });
    }
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/resource': sinon.stub().returns(resourceMock)
  });
});
