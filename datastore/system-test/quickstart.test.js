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

const proxyquire = require(`proxyquire`).noPreserveCache();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const datastore = proxyquire(`@google-cloud/datastore`, {})();

const entity = { description: `Buy milk` };
const kind = `Task`;
const name = `sampletask1`;
const key = datastore.key([kind, name]);
const datastoreEntity = Object.assign({}, entity);
datastoreEntity[datastore.KEY] = key;

test.before(async () => {
  try {
    await datastore.delete(key);
  } catch (err) {} // ignore error
});
test.after.always(async () => {
  try {
    await datastore.delete(key);
  } catch (err) {} // ignore error
});

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.cb(`should get a task from Datastore`, (t) => {
  const datastoreMock = {
    key: (...args) => datastore.key(...args),

    save: (_task) => {
      t.is(_task.key.kind, kind);
      t.is(_task.key.name, name);
      t.deepEqual(_task.data, entity);

      return datastore.save(_task)
        .then(() => {
          setTimeout(() => {
            datastore.get(key)
              .then(([task]) => {
                t.deepEqual(task, datastoreEntity);
                t.true(console.log.calledWith(`Saved ${name}: ${entity.description}`));
                t.end();
              })
              .catch(t.end);
          }, 200);
        }, t.end);
    }
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/datastore': sinon.stub().returns(datastoreMock)
  });
});
