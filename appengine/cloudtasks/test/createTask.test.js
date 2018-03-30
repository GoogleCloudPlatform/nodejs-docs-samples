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

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

test.before(tools.stubConsole);
test.after.always(tools.restoreConsole);

test.cb(`should create a task`, (t) => {
  const responseMock = {
    name: 'foo'
  };
  const cloudtasksMock = {
    projects: {
      locations: {
        queues: {
          tasks: {
            create: sinon.stub().yields(responseMock)
          }
        }
      }
    }
  };
  const authClientMock = {};

  const util = proxyquire(`../createTask`, {
    googleapis: {
      google: {
        cloudtasks: sinon.stub().returns(cloudtasksMock),
        auth: {
          getApplicationDefault: sinon.stub().yields(null, authClientMock)
        }
      }
    }
  });

  util.createTask('p', 'l', 'q', {});

  setTimeout(() => {
    t.true(console.log.called);
    t.is(cloudtasksMock.projects.locations.queues.tasks.create.callCount, 1);
    t.end();
  }, 500);
});
